from __future__ import annotations

import csv
import io
from datetime import datetime
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session

from .config import BASE_DIR, DB_PATH, settings
from .database import Base, engine, get_db
from .models import Department, Doctor, History, Patient, PriorityLevel, QueueStatus, Settings
from .queue_engine import QueueEngine
from .realtime import manager
from .schemas import (
    ActionResponse,
    AnalyticsOut,
    AppBootstrapOut,
    AuthPayload,
    DepartmentOut,
    DoctorOut,
    HistoryOut,
    PatientCreate,
    PatientOut,
    PatientUpdate,
    QueueControlOut,
    SettingsOut,
    SettingsPayload,
)

Base.metadata.create_all(bind=engine)
app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def bootstrap_seed(db: Session) -> None:
    if db.query(Department).count() == 0:
        departments = [
            Department(name="General Medicine", color="#2563EB", average_consultation_minutes=8),
            Department(name="Cardiology", color="#22C55E", average_consultation_minutes=12),
            Department(name="Pediatrics", color="#0EA5E9", average_consultation_minutes=10),
            Department(name="Emergency", color="#EF4444", average_consultation_minutes=6),
            Department(name="Orthopedics", color="#F59E0B", average_consultation_minutes=9),
        ]
        db.add_all(departments)
    if db.query(Doctor).count() == 0:
        db.add_all(
            [
                Doctor(name="Dr. Aanya Sharma", specialty="General Medicine", department_id=1, average_speed_factor=1.1),
                Doctor(name="Dr. Rohan Iyer", specialty="Cardiology", department_id=2, average_speed_factor=0.9),
                Doctor(name="Dr. Meera Kapoor", specialty="Pediatrics", department_id=3, average_speed_factor=1.3),
                Doctor(name="Dr. Faisal Khan", specialty="Emergency", department_id=4, average_speed_factor=1.5),
            ]
        )
    defaults = {
        "average_consultation_minutes": "8",
        "theme": "light",
        "hospital_name": "Queue Cure '26",
        "queue_paused": "false",
    }
    for key, value in defaults.items():
        existing = db.query(Settings).filter(Settings.key == key).first()
        if not existing:
            db.add(Settings(key=key, value=value))
    db.commit()


def setting_value(db: Session, key: str, fallback: str) -> str:
    row = db.query(Settings).filter(Settings.key == key).first()
    return row.value if row else fallback


def app_state_payload(db: Session) -> dict:
    service = QueueEngine(db)
    return {
        "queue": [PatientOut.model_validate(patient).model_dump(mode="json") for patient in service.sorted_queue()],
        "analytics": service.analytics(),
        "history": [HistoryOut.model_validate(item).model_dump(mode="json") for item in db.query(History).order_by(History.created_at.desc()).limit(25).all()],
    }


@app.on_event("startup")
def on_startup() -> None:
    db = next(get_db())
    try:
        bootstrap_seed(db)
    finally:
        db.close()


@app.get("/")
def root() -> dict:
    return {"name": settings.app_name, "status": "healthy"}


@app.get("/bootstrap", response_model=AppBootstrapOut)
def bootstrap(db: Annotated[Session, Depends(get_db)]) -> AppBootstrapOut:
    bootstrap_seed(db)
    engine_service = QueueEngine(db)
    queue = engine_service.sorted_queue()
    analytics_data = engine_service.analytics()
    settings_payload = SettingsOut(
        average_consultation_minutes=int(db.query(Settings).filter(Settings.key == "average_consultation_minutes").first().value),
        theme=db.query(Settings).filter(Settings.key == "theme").first().value,
        hospital_name=db.query(Settings).filter(Settings.key == "hospital_name").first().value,
        departments=[DepartmentOut.model_validate(department) for department in db.query(Department).all()],
    )
    return AppBootstrapOut(
        settings=settings_payload,
        queue=[PatientOut.model_validate(patient) for patient in queue],
        analytics=AnalyticsOut.model_validate(analytics_data),
        departments=[DepartmentOut.model_validate(department) for department in db.query(Department).all()],
        doctors=[DoctorOut.model_validate(doctor) for doctor in db.query(Doctor).all()],
        history=[HistoryOut.model_validate(history) for history in db.query(History).order_by(History.created_at.desc()).limit(25).all()],
    )


async def broadcast_state(db: Session, event_type: str) -> None:
    await manager.broadcast(event_type, app_state_payload(db))


@app.get("/patients", response_model=list[PatientOut])
def list_patients(db: Annotated[Session, Depends(get_db)]) -> list[PatientOut]:
    patients = db.query(Patient).filter(Patient.is_deleted.is_(False)).order_by(Patient.created_at.asc()).all()
    return [PatientOut.model_validate(patient) for patient in patients]


@app.get("/departments", response_model=list[DepartmentOut])
def list_departments(db: Annotated[Session, Depends(get_db)]) -> list[DepartmentOut]:
    bootstrap_seed(db)
    return [DepartmentOut.model_validate(department) for department in db.query(Department).order_by(Department.id.asc()).all()]


@app.get("/doctors", response_model=list[DoctorOut])
def list_doctors(db: Annotated[Session, Depends(get_db)]) -> list[DoctorOut]:
    bootstrap_seed(db)
    return [DoctorOut.model_validate(doctor) for doctor in db.query(Doctor).order_by(Doctor.id.asc()).all()]


@app.post("/patients", response_model=ActionResponse)
async def create_patient(payload: PatientCreate, db: Annotated[Session, Depends(get_db)]) -> ActionResponse:
    bootstrap_seed(db)
    service = QueueEngine(db)
    patient = service.create_patient(payload.model_dump())
    db.commit()
    await broadcast_state(db, "patient_added")
    return ActionResponse(ok=True, message="Patient registered", patient=PatientOut.model_validate(patient), queue=[PatientOut.model_validate(item) for item in service.sorted_queue()], analytics=AnalyticsOut.model_validate(service.analytics()))


@app.get("/queue", response_model=list[PatientOut])
def get_queue(db: Annotated[Session, Depends(get_db)]) -> list[PatientOut]:
    service = QueueEngine(db)
    return [PatientOut.model_validate(patient) for patient in service.sorted_queue()]


@app.post("/call-next", response_model=ActionResponse)
async def call_next(db: Annotated[Session, Depends(get_db)]) -> ActionResponse:
    service = QueueEngine(db)
    if service.is_paused():
        raise HTTPException(status_code=423, detail="Queue is paused")
    patient = service.call_next()
    if not patient:
        raise HTTPException(status_code=404, detail="Queue is empty")
    db.commit()
    await broadcast_state(db, "patient_called")
    return ActionResponse(ok=True, message="Next patient called", patient=PatientOut.model_validate(patient), queue=[PatientOut.model_validate(item) for item in service.sorted_queue()], analytics=AnalyticsOut.model_validate(service.analytics()))


@app.put("/patient/{patient_id}", response_model=ActionResponse)
async def update_patient(patient_id: int, payload: PatientUpdate, db: Annotated[Session, Depends(get_db)]) -> ActionResponse:
    service = QueueEngine(db)
    patient = db.get(Patient, patient_id)
    if not patient or patient.is_deleted:
        raise HTTPException(status_code=404, detail="Patient not found")
    if payload.status is not None:
        patient.status = payload.status
    if payload.doctor is not None:
        patient.doctor = payload.doctor
    if payload.priority is not None:
        patient.priority = payload.priority
    if payload.emergency is not None:
        patient.emergency = payload.emergency
    if payload.senior_citizen is not None:
        patient.senior_citizen = payload.senior_citizen
    if payload.consultation_minutes is not None:
        service.update_consultation_time(patient_id, payload.consultation_minutes)
    patient.updated_at = datetime.utcnow()
    db.commit()
    await broadcast_state(db, "queue_updated")
    return ActionResponse(
        ok=True,
        message="Patient updated",
        patient=PatientOut.model_validate(patient),
        queue=[PatientOut.model_validate(item) for item in service.sorted_queue()],
        analytics=AnalyticsOut.model_validate(service.analytics()),
    )


@app.post("/complete", response_model=ActionResponse)
async def complete_patient(patient_id: int, db: Annotated[Session, Depends(get_db)]) -> ActionResponse:
    service = QueueEngine(db)
    patient = service.complete_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.commit()
    await broadcast_state(db, "patient_completed")
    return ActionResponse(ok=True, message="Patient completed", patient=PatientOut.model_validate(patient), queue=[PatientOut.model_validate(item) for item in service.sorted_queue()], analytics=AnalyticsOut.model_validate(service.analytics()))


@app.delete("/patient/{patient_id}", response_model=ActionResponse)
async def delete_patient(patient_id: int, db: Annotated[Session, Depends(get_db)]) -> ActionResponse:
    service = QueueEngine(db)
    patient = service.delete_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.commit()
    await broadcast_state(db, "patient_deleted")
    return ActionResponse(ok=True, message="Patient deleted", patient=PatientOut.model_validate(patient), queue=[PatientOut.model_validate(item) for item in service.sorted_queue()], analytics=AnalyticsOut.model_validate(service.analytics()))


@app.post("/patient/{patient_id}/consultation-time", response_model=ActionResponse)
async def update_consultation_time(patient_id: int, consultation_minutes: int, db: Annotated[Session, Depends(get_db)]) -> ActionResponse:
    service = QueueEngine(db)
    patient = service.update_consultation_time(patient_id, consultation_minutes)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.commit()
    await broadcast_state(db, "queue_updated")
    return ActionResponse(ok=True, message="Consultation time updated", patient=PatientOut.model_validate(patient), queue=[PatientOut.model_validate(item) for item in service.sorted_queue()], analytics=AnalyticsOut.model_validate(service.analytics()))


@app.put("/settings", response_model=SettingsOut)
async def update_settings(payload: SettingsPayload, db: Annotated[Session, Depends(get_db)]) -> SettingsOut:
    setting_map = {
        "average_consultation_minutes": str(payload.average_consultation_minutes),
        "theme": payload.theme,
        "hospital_name": payload.hospital_name,
    }
    for key, value in setting_map.items():
        row = db.query(Settings).filter(Settings.key == key).first()
        if row:
            row.value = value
        else:
            db.add(Settings(key=key, value=value))
    db.commit()
    await manager.broadcast("settings_updated", setting_map)
    return SettingsOut(
        average_consultation_minutes=payload.average_consultation_minutes,
        theme=payload.theme,
        hospital_name=payload.hospital_name,
        departments=[DepartmentOut.model_validate(department) for department in db.query(Department).all()],
    )


@app.get("/backup/database")
def backup_database() -> FileResponse:
    if not DB_PATH.exists():
        raise HTTPException(status_code=404, detail="Database file not found")
    return FileResponse(DB_PATH, filename=f"queue_cure_backup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.db")


@app.post("/restore/database", response_model=QueueControlOut)
async def restore_database(file: UploadFile = File(...)) -> QueueControlOut:
    content = await file.read()
    DB_PATH.write_bytes(content)
    return QueueControlOut(ok=True, message="Database restored")


@app.get("/export/queue.csv")
def export_queue_csv(db: Annotated[Session, Depends(get_db)]) -> StreamingResponse:
    service = QueueEngine(db)
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["token", "name", "age", "gender", "department", "doctor", "priority", "status", "estimated_wait_minutes", "confidence"])
    for patient in service.sorted_queue():
        writer.writerow([
            patient.token,
            patient.name,
            patient.age,
            patient.gender,
            patient.department,
            patient.doctor,
            patient.priority,
            patient.status,
            patient.estimated_wait_minutes,
            patient.confidence,
        ])
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=queue_cure_queue.csv"},
    )


@app.get("/analytics", response_model=AnalyticsOut)
def get_analytics(db: Annotated[Session, Depends(get_db)]) -> AnalyticsOut:
    service = QueueEngine(db)
    return AnalyticsOut.model_validate(service.analytics())


@app.get("/history", response_model=list[HistoryOut])
def get_history(db: Annotated[Session, Depends(get_db)]) -> list[HistoryOut]:
    history = db.query(History).order_by(History.created_at.desc()).limit(100).all()
    return [HistoryOut.model_validate(item) for item in history]


@app.post("/auth/login")
def login(payload: AuthPayload) -> dict:
    return {"ok": True, "token": "demo-jwt-token", "user": {"email": payload.email, "role": "receptionist"}}


@app.post("/queue/reset")
def reset_queue(db: Annotated[Session, Depends(get_db)]) -> dict:
    db.query(Patient).delete()
    db.query(History).delete()
    db.commit()
    return {"ok": True}


@app.post("/queue/pause", response_model=QueueControlOut)
def pause_queue(db: Annotated[Session, Depends(get_db)]) -> QueueControlOut:
    row = db.query(Settings).filter(Settings.key == "queue_paused").first()
    if row:
        row.value = "true"
    else:
        db.add(Settings(key="queue_paused", value="true"))
    db.commit()
    return QueueControlOut(ok=True, message="Queue paused")


@app.post("/queue/resume", response_model=QueueControlOut)
def resume_queue(db: Annotated[Session, Depends(get_db)]) -> QueueControlOut:
    row = db.query(Settings).filter(Settings.key == "queue_paused").first()
    if row:
        row.value = "false"
    else:
        db.add(Settings(key="queue_paused", value="false"))
    db.commit()
    return QueueControlOut(ok=True, message="Queue resumed")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/logo.svg")
def logo() -> FileResponse:
    return FileResponse(BASE_DIR.parent / "assets" / "logo.svg")
