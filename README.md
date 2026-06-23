# Queue Cure '26

Smart Clinic Queue Management System built for a hackathon-grade healthcare SaaS demo.

## Project Overview

Queue Cure '26 is a premium clinic queue platform for reception desks, patients, and digital signage. It combines a priority-aware queue engine, real-time WebSocket sync, intelligent wait-time prediction, multi-screen UI, and admin tooling for a hackathon-ready healthcare SaaS demo.

## Features

- Priority queue engine with Emergency, Senior Citizen, and FIFO-normal ordering
- Intelligent wait-time prediction based on department load, doctor speed, and queue position
- FastAPI backend with SQLite persistence
- Real-time WebSocket sync for queue, analytics, settings, and history
- Reception dashboard with search, filters, and queue actions
- Patient registration flow with auto-generated tokens
- Live TV display and mobile QR access
- TV display and live queue screens
- Analytics dashboard with charts and operational insights
- Dark mode and mobile responsive UI
- Docker and Docker Compose ready
- Backup, restore, export, pause, and resume admin operations

## Tech Stack

- React 19, TypeScript, Vite
- Tailwind CSS, Framer Motion, Zustand, React Hook Form, Axios
- FastAPI, SQLAlchemy, SQLite, Pydantic, WebSockets, Uvicorn
- Docker, Docker Compose

## Architecture

- Frontend consumes FastAPI REST endpoints and a shared WebSocket stream.
- The backend owns queue ordering, estimated wait calculation, analytics, history, and operational controls.
- SQLite stores patients, doctors, departments, settings, queue snapshots, and history.
- The UI is organized as a premium SaaS shell with reusable components, modal workflows, and live state hydration.

## Folder Structure

```text
backend/
  app/
frontend/
  src/
docs/
assets/
```

## API Documentation

- `GET /bootstrap` - full app bootstrap payload
- `GET /patients` - list active patients
- `GET /departments` - list departments
- `GET /doctors` - list doctors
- `GET /queue` - current ordered queue
- `POST /patients` - register a new patient
- `PUT /patient/{id}` - update a patient record
- `POST /patient/{id}/consultation-time` - update consultation duration
- `POST /call-next` - call the next patient
- `POST /complete` - complete a patient
- `DELETE /patient/{id}` - delete or skip a patient
- `PUT /settings` - update clinic settings and theme
- `GET /analytics` - dashboard metrics
- `GET /history` - queue history
- `POST /queue/pause` - pause the queue engine
- `POST /queue/resume` - resume the queue engine
- `POST /queue/reset` - clear queue and history
- `GET /export/queue.csv` - export queue data
- `GET /backup/database` - download the SQLite backup
- `POST /restore/database` - restore a SQLite backup
- `GET /health` - health check
- `GET /logo.svg` - app logo asset

## WebSocket Events

- `patient_added`
- `patient_called`
- `patient_completed`
- `patient_deleted`
- `queue_updated`
- `settings_updated`
- `analytics_updated`

## Database Schema

- `patients` - patient registration and live queue state
- `doctors` - doctor directory and speed factors
- `departments` - department metadata and consultation averages
- `queue_snapshots` - snapshot trail for queue state
- `settings` - theme and hospital controls
- `history` - operational audit trail

## Realtime Flow

1. The frontend loads `/bootstrap`.
2. The receptionist adds or updates a patient.
3. The backend recalculates the queue and wait times.
4. FastAPI broadcasts a WebSocket event.
5. All connected clients update instantly.

## Installation

```bash
cd backend
pip install -r requirements.txt

cd ../frontend
npm install
```

## Running Locally

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
# install deps and develop
npm install
npm run typecheck    # optional: runs `tsc --noEmit`
npm run dev

# or build for production:
npm run build
# then serve the contents of `frontend/dist` with any static server
```

Docker Compose:

```bash
docker compose up --build
```

## Diagrams

See `docs/diagrams.md`.

## Presentation Assets

- Premium landing page
- Split-screen login experience
- Reception dashboard with analytics and live queue controls
- Registration modal with priority-aware intake
- Live queue display and TV signage mode
- Analytics dashboard with charts and realtime sync

## Future Scope

- Role-based access control
- SMS and WhatsApp notifications
- Multi-branch support
- Appointment scheduling
- Teleconsultation check-in

## License

MIT
