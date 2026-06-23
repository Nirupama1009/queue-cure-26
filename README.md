# Queue Cure '26

## Smart Clinic Queue Management System

> A modern, real-time hospital queue management platform built using React, FastAPI, WebSockets, and SQLite to streamline patient flow, reduce waiting times, and improve clinic operations.

---

# Project Overview

Queue Cure '26 is a smart healthcare queue management solution designed for clinics and hospitals. It enables receptionists to efficiently manage patient flow while providing patients with live queue updates, estimated waiting times, and digital display support.

Built as a hackathon project, Queue Cure '26 focuses on delivering a premium healthcare SaaS experience with real-time synchronization, intelligent queue prioritization, and responsive user interfaces.

---

# Features

- Smart Queue Management
- Emergency Patient Priority
- Senior Citizen Priority
- Doctor & Department Assignment
- Automatic Token Generation
- Intelligent Wait Time Prediction
- Real-Time Queue Updates using WebSockets
- TV Display Mode
- Mobile Live Queue with QR Code Access
- Analytics Dashboard
- Queue History
- Search & Filter Patients
- Dark Mode Support
- CSV Export
- Docker Ready
- Fully Responsive Design

---

# Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand
- React Hook Form
- Axios
- Recharts

## Backend

- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- WebSockets
- Uvicorn

## DevOps

- Docker
- Docker Compose

---

# Screenshots



| Screen | Preview |
|---------|---------|
|Landing Page |<img width="772" height="881" alt="Screenshot 2026-06-23 192028" src="https://github.com/user-attachments/assets/6ba8475d-822a-4451-8772-5b798c8dddb0" />
|---------|---------|
|Login |<img width="1622" height="844" alt="Screenshot 2026-06-23 192248" src="https://github.com/user-attachments/assets/608640c8-414f-4d5b-994b-2f77cae68145" />
|---------|---------|
|Dashboard |<img width="1184" height="907" alt="Screenshot 2026-06-23 192411" src="https://github.com/user-attachments/assets/afd66b29-10e3-444f-a4e9-44356972578e" />
|---------|---------|
|Patient Registration |<img width="1590" height="898" alt="Screenshot 2026-06-23 192441" src="https://github.com/user-attachments/assets/2a4b7fe8-b507-45a9-a034-8eb249640aa7" />
|---------|---------|
|Live Queue |<img width="1327" height="874" alt="Screenshot 2026-06-23 192506" src="https://github.com/user-attachments/assets/7714d9e6-4696-4650-bdee-9f336ec4ec75" />
|---------|---------|
|TV Display |<img width="1894" height="912" alt="Screenshot 2026-06-23 192534" src="https://github.com/user-attachments/assets/16d067f7-9366-4e4e-9189-017f8dfe44d7" />
|---------|---------|
|Analytics |<img width="1258" height="905" alt="Screenshot 2026-06-23 192608" src="https://github.com/user-attachments/assets/dcf9549d-c939-4927-afe5-bf10c8c2d63d" />
|---------|---------|
|History |<img width="1289" height="840" alt="Screenshot 2026-06-23 192645" src="https://github.com/user-attachments/assets/f97e1862-35fa-440a-a9a9-18e80ccfad76" />


---

# System Architecture

```text
                React + TypeScript
                        │
        REST API + WebSockets
                        │
                FastAPI Backend
                        │
        Queue Engine & Business Logic
                        │
                 SQLite Database
```

---

# Application Workflow

1. Receptionist registers a patient.
2. A unique token is generated automatically.
3. Queue engine prioritizes patients.
4. Estimated waiting time is calculated.
5. Backend broadcasts updates through WebSockets.
6. Dashboard, TV Display, and Live Queue update instantly.
7. Doctor completes consultation.
8. Analytics and History update automatically.

---

# Queue Priority Logic

```text
Emergency
      ↓
Senior Citizen
      ↓
Normal (FIFO)
```

---

# Folder Structure

```text
Queue Cure '26
│
├── backend
│   ├── app
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── Dockerfile
│
├── assets
├── docs
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# REST API

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Health Check |
| GET | `/bootstrap` | Initial Application Data |
| GET | `/patients` | Get Patients |
| GET | `/queue` | Current Queue |
| POST | `/patients` | Register Patient |
| POST | `/call-next` | Call Next Patient |
| POST | `/complete` | Complete Consultation |
| DELETE | `/patient/{id}` | Delete Patient |
| GET | `/analytics` | Dashboard Analytics |
| GET | `/history` | Queue History |
| PUT | `/settings` | Update Settings |

---

# WebSocket Events

```text
patient_added
patient_called
patient_completed
patient_deleted
queue_updated
analytics_updated
settings_updated
```

---

# Database

The application uses SQLite with the following tables:

- Patients
- Doctors
- Departments
- Queue Snapshots
- Settings
- History

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Nirupama1009/queue-cure-26.git
cd queue-cure-26
```

## Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Docker

```bash
docker compose up --build
```
![Uploading Screenshot 2026-06-23 192028.png…]()


---

# Project Highlights

- Real-Time Synchronization
- Smart Priority Queue Engine
- Live TV Display
- Mobile QR Queue Access
- Analytics Dashboard
- Dark Mode
- Queue Export
- Docker Support

---

# Future Enhancements

- SMS Notifications
- WhatsApp Alerts
- AI-Based Wait Time Prediction
- Appointment Booking
- Multi-Clinic Support
- Doctor Login Portal
- Role-Based Access Control
- Cloud Deployment

---

# Developer

**Nirupama R**

BE Computer Science (Artificial Intelligence & Machine Learning)

GitHub: https://github.com/Nirupama1009

---

# Hackathon

Developed as a submission for the Queue Cure '26 Hackathon, showcasing a modern healthcare queue management platform with real-time communication and intelligent queue prioritization.

---

# License

This project is licensed under the MIT License.
