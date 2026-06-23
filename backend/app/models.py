from __future__ import annotations

from datetime import datetime
from enum import Enum
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class PriorityLevel(str, Enum):
    emergency = "Emergency"
    senior = "Senior Citizen"
    normal = "Normal"


class QueueStatus(str, Enum):
    waiting = "Waiting"
    called = "Called"
    in_consultation = "In Consultation"
    completed = "Completed"
    skipped = "Skipped"


class ThemeMode(str, Enum):
    light = "light"
    dark = "dark"


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    color: Mapped[str] = mapped_column(String(32), default="#2563EB")
    average_consultation_minutes: Mapped[int] = mapped_column(Integer, default=8)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    doctors: Mapped[list["Doctor"]] = relationship(back_populates="department")


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    specialty: Mapped[str] = mapped_column(String(120), nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    average_speed_factor: Mapped[float] = mapped_column(Float, default=1.0)
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)

    department: Mapped[Department | None] = relationship(back_populates="doctors")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    token: Mapped[str] = mapped_column(String(24), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(24), nullable=False)
    phone: Mapped[str] = mapped_column(String(24), nullable=False)
    department: Mapped[str] = mapped_column(String(120), nullable=False)
    doctor: Mapped[str] = mapped_column(String(120), nullable=False)
    symptoms: Mapped[str] = mapped_column(Text, default="")
    priority: Mapped[str] = mapped_column(String(32), default=PriorityLevel.normal.value)
    emergency: Mapped[bool] = mapped_column(Boolean, default=False)
    senior_citizen: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(32), default=QueueStatus.waiting.value)
    estimated_wait_minutes: Mapped[int] = mapped_column(Integer, default=0)
    confidence: Mapped[int] = mapped_column(Integer, default=100)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    called_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    consultation_minutes: Mapped[int] = mapped_column(Integer, default=8)
    queue_order: Mapped[int] = mapped_column(Integer, default=0, index=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class QueueSnapshot(Base):
    __tablename__ = "queue_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False)
    token: Mapped[str] = mapped_column(String(24), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    payload: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Settings(Base):
    __tablename__ = "settings"
    __table_args__ = (UniqueConstraint("key", name="uq_settings_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(120), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class History(Base):
    __tablename__ = "history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    token: Mapped[str] = mapped_column(String(24), index=True, nullable=False)
    patient_name: Mapped[str] = mapped_column(String(120), nullable=False)
    action: Mapped[str] = mapped_column(String(64), nullable=False)
    details: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
