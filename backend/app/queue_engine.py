from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from datetime import datetime, timedelta
from statistics import mean
from typing import Literal

from sqlalchemy.orm import Session

from .models import Department, Doctor, History, Patient, PriorityLevel, QueueStatus, Settings


PRIORITY_WEIGHT = {
    PriorityLevel.emergency.value: 0,
    PriorityLevel.senior.value: 1,
    PriorityLevel.normal.value: 2,
}


@dataclass(frozen=True)
class Prediction:
    wait_minutes: int
    confidence: int


class QueueEngine:
    def __init__(self, db: Session):
        self.db = db

    def is_paused(self) -> bool:
        setting = self.db.query(Settings).filter(Settings.key == "queue_paused").first()
        return setting.value == "true" if setting else False

    def _next_token(self) -> str:
        today = datetime.utcnow().strftime("%y%m%d")
        count = self.db.query(Patient).count() + 1
        return f"QC-{today}-{count:04d}"

    def _consultation_minutes(self, department: str, doctor: str) -> int:
        department_row = self.db.query(Department).filter(Department.name == department).first()
        doctor_row = self.db.query(Doctor).filter(Doctor.name == doctor).first()
        fallback = self._settings_average()
        department_minutes = department_row.average_consultation_minutes if department_row else fallback
        speed_factor = doctor_row.average_speed_factor if doctor_row else 1.0
        calculated = round(department_minutes / max(speed_factor, 0.5))
        return max(3, calculated)

    def _settings_average(self) -> int:
        setting = self.db.query(Settings).filter(Settings.key == "average_consultation_minutes").first()
        return int(setting.value) if setting else 8

    def _recent_histories(self) -> list[History]:
        return self.db.query(History).order_by(History.created_at.desc()).limit(20).all()

    def create_patient(self, payload: dict) -> Patient:
        token = self._next_token()
        consultation_minutes = payload.get("consultation_minutes") or self._consultation_minutes(payload["department"], payload["doctor"])
        patient = Patient(
            token=token,
            name=payload["name"],
            age=payload["age"],
            gender=payload["gender"],
            phone=payload["phone"],
            department=payload["department"],
            doctor=payload["doctor"],
            symptoms=payload.get("symptoms", ""),
            priority=payload.get("priority", PriorityLevel.normal.value),
            emergency=payload.get("emergency", False),
            senior_citizen=payload.get("senior_citizen", False),
            status=QueueStatus.waiting.value,
            consultation_minutes=consultation_minutes,
        )
        patient.queue_order = self._queue_order(patient)
        self.db.add(patient)
        self.db.flush()
        self.db.add(History(token=patient.token, patient_name=patient.name, action="patient_added", details=f"{patient.department} / {patient.priority}"))
        self.recalculate_wait_times()
        return patient

    def _queue_order(self, patient: Patient) -> int:
        waiting_patients = self.db.query(Patient).filter(Patient.is_deleted.is_(False)).all()
        if not waiting_patients:
            return 1
        return max((item.queue_order for item in waiting_patients), default=0) + 1

    def sorted_queue(self) -> list[Patient]:
        waiting = self.db.query(Patient).filter(Patient.is_deleted.is_(False), Patient.status != QueueStatus.completed.value).all()
        return sorted(
            waiting,
            key=lambda patient: (
                PRIORITY_WEIGHT.get(patient.priority, 2),
                patient.status != QueueStatus.waiting.value,
                patient.queue_order,
                patient.created_at,
            ),
        )

    def call_next(self) -> Patient | None:
        if self.is_paused():
            return None
        queue = self.sorted_queue()
        if not queue:
            return None
        patient = queue[0]
        patient.status = QueueStatus.called.value
        patient.called_at = datetime.utcnow()
        patient.updated_at = datetime.utcnow()
        self.db.add(History(token=patient.token, patient_name=patient.name, action="patient_called", details=patient.department))
        self.recalculate_wait_times()
        return patient

    def complete_patient(self, patient_id: int) -> Patient | None:
        patient = self.db.get(Patient, patient_id)
        if not patient:
            return None
        patient.status = QueueStatus.completed.value
        patient.completed_at = datetime.utcnow()
        patient.updated_at = datetime.utcnow()
        self.db.add(History(token=patient.token, patient_name=patient.name, action="patient_completed", details=patient.department))
        self.recalculate_wait_times()
        return patient

    def delete_patient(self, patient_id: int) -> Patient | None:
        patient = self.db.get(Patient, patient_id)
        if not patient:
            return None
        patient.is_deleted = True
        patient.status = QueueStatus.skipped.value
        patient.updated_at = datetime.utcnow()
        self.db.add(History(token=patient.token, patient_name=patient.name, action="patient_deleted", details=patient.department))
        self.recalculate_wait_times()
        return patient

    def update_consultation_time(self, patient_id: int, consultation_minutes: int) -> Patient | None:
        patient = self.db.get(Patient, patient_id)
        if not patient:
            return None
        patient.consultation_minutes = consultation_minutes
        patient.updated_at = datetime.utcnow()
        self.db.add(History(token=patient.token, patient_name=patient.name, action="consultation_updated", details=str(consultation_minutes)))
        self.recalculate_wait_times()
        return patient

    def estimate_wait(self, patient: Patient, queue: Iterable[Patient]) -> Prediction:
        ahead = [item for item in queue if item.id != patient.id and self._is_ahead(item, patient)]
        base_minutes = sum(item.consultation_minutes for item in ahead)
        department_factor = 1.0
        doctor_factor = 1.0
        department_row = self.db.query(Department).filter(Department.name == patient.department).first()
        if department_row:
            department_factor = max(0.7, min(1.4, department_row.average_consultation_minutes / max(self._settings_average(), 1)))
        doctor_row = self.db.query(Doctor).filter(Doctor.name == patient.doctor).first()
        if doctor_row:
            doctor_factor = max(0.6, min(1.6, 1.2 / max(doctor_row.average_speed_factor, 0.5)))
        predicted = round(base_minutes * department_factor * doctor_factor)
        confidence = max(50, min(98, 94 - len(ahead) * 2))
        return Prediction(wait_minutes=predicted, confidence=confidence)

    def _is_ahead(self, left: Patient, right: Patient) -> bool:
        left_rank = (PRIORITY_WEIGHT.get(left.priority, 2), left.queue_order)
        right_rank = (PRIORITY_WEIGHT.get(right.priority, 2), right.queue_order)
        return left_rank < right_rank

    def recalculate_wait_times(self) -> None:
        queue = self.sorted_queue()
        for position, patient in enumerate(queue):
            prediction = self.estimate_wait(patient, queue[:position])
            patient.estimated_wait_minutes = prediction.wait_minutes
            patient.confidence = prediction.confidence
            patient.queue_order = position + 1
            patient.updated_at = datetime.utcnow()
        self.db.flush()

    def analytics(self) -> dict:
        queue = self.sorted_queue()
        patients = self.db.query(Patient).filter(Patient.is_deleted.is_(False)).all()
        completed = [patient for patient in patients if patient.status == QueueStatus.completed.value]
        today = datetime.utcnow().date()
        served_today = [patient for patient in completed if patient.completed_at and patient.completed_at.date() == today]
        average_wait = round(mean([patient.estimated_wait_minutes for patient in completed]) if completed else 0, 1)
        longest_wait = max([patient.estimated_wait_minutes for patient in patients], default=0)
        dept_counts: dict[str, int] = {}
        for patient in queue:
            dept_counts[patient.department] = dept_counts.get(patient.department, 0) + 1
        busiest_department = max(dept_counts, key=dept_counts.get) if dept_counts else "General Medicine"
        department_breakdown = [{"name": name, "value": count} for name, count in dept_counts.items()]
        wait_trend = [
            {"name": history.created_at.strftime("%H:%M"), "value": index * 3 + 5}
            for index, history in enumerate(self._recent_histories()[:8])
        ]
        doctor_performance = []
        for doctor in self.db.query(Doctor).all():
            doctor_patients = [patient for patient in completed if patient.doctor == doctor.name]
            doctor_performance.append(
                {
                    "name": doctor.name,
                    "served": len(doctor_patients),
                    "speed": doctor.average_speed_factor,
                }
            )
        return {
            "patients_served_today": len(served_today),
            "average_wait_minutes": average_wait,
            "longest_wait_minutes": longest_wait,
            "busiest_department": busiest_department,
            "queue_length": len(queue),
            "emergency_count": sum(1 for patient in queue if patient.priority == PriorityLevel.emergency.value),
            "senior_count": sum(1 for patient in queue if patient.priority == PriorityLevel.senior.value),
            "normal_count": sum(1 for patient in queue if patient.priority == PriorityLevel.normal.value),
            "department_breakdown": department_breakdown,
            "wait_trend": wait_trend,
            "doctor_performance": doctor_performance,
            "confidence_average": round(mean([patient.confidence for patient in queue]) if queue else 0, 1),
        }
