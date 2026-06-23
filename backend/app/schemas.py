from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class DepartmentOut(BaseModel):
    id: int
    name: str
    color: str
    average_consultation_minutes: int
    is_active: bool

    model_config = {"from_attributes": True}


class DoctorOut(BaseModel):
    id: int
    name: str
    specialty: str
    is_available: bool
    average_speed_factor: float
    department_id: int | None

    model_config = {"from_attributes": True}


class PatientCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    age: int = Field(ge=0, le=130)
    gender: str = Field(min_length=1, max_length=24)
    phone: str = Field(min_length=7, max_length=24)
    department: str = Field(min_length=2, max_length=120)
    doctor: str = Field(min_length=2, max_length=120)
    symptoms: str = Field(default="", max_length=500)
    priority: str = Field(default="Normal")
    emergency: bool = False
    senior_citizen: bool = False
    consultation_minutes: int | None = Field(default=None, ge=1, le=180)


class PatientUpdate(BaseModel):
    status: str | None = None
    consultation_minutes: int | None = Field(default=None, ge=1, le=180)
    doctor: str | None = None
    priority: str | None = None
    emergency: bool | None = None
    senior_citizen: bool | None = None


class PatientOut(BaseModel):
    id: int
    token: str
    name: str
    age: int
    gender: str
    phone: str
    department: str
    doctor: str
    symptoms: str
    priority: str
    emergency: bool
    senior_citizen: bool
    status: str
    estimated_wait_minutes: int
    confidence: int
    created_at: datetime
    updated_at: datetime
    called_at: datetime | None
    completed_at: datetime | None
    consultation_minutes: int
    queue_order: int

    model_config = {"from_attributes": True}


class SettingsPayload(BaseModel):
    average_consultation_minutes: int = Field(ge=1, le=180)
    theme: str = Field(default="light")
    hospital_name: str = Field(default="Queue Cure '26")
    departments: list[DepartmentOut] | None = None


class SettingsOut(BaseModel):
    average_consultation_minutes: int
    theme: str
    hospital_name: str
    departments: list[DepartmentOut]


class AnalyticsOut(BaseModel):
    patients_served_today: int
    average_wait_minutes: float
    longest_wait_minutes: int
    busiest_department: str
    queue_length: int
    emergency_count: int
    senior_count: int
    normal_count: int
    department_breakdown: list[dict]
    wait_trend: list[dict]
    doctor_performance: list[dict]
    confidence_average: float


class ActionResponse(BaseModel):
    ok: bool
    message: str
    patient: PatientOut | None = None
    queue: list[PatientOut] | None = None
    analytics: AnalyticsOut | None = None


class HistoryOut(BaseModel):
    id: int
    token: str
    patient_name: str
    action: str
    details: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthPayload(BaseModel):
    email: EmailStr
    password: str


class AppBootstrapOut(BaseModel):
    settings: SettingsOut
    queue: list[PatientOut]
    analytics: AnalyticsOut
    departments: list[DepartmentOut]
    doctors: list[DoctorOut]
    history: list[HistoryOut]


class QueueControlOut(BaseModel):
    ok: bool
    message: str
