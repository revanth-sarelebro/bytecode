# MediSync client

React + Vite + Tailwind frontend for MediSync.

## Run

    npm install
    cp .env.example .env     # set VITE_API_BASE_URL
    npm run dev

## API contract (share with the backend dev)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | /auth/login | email, password | { token, user: {id, name, email, role} } |
| POST | /auth/register | name, email, password | same as login. Role is always PATIENT |
| GET | /auth/me | none | user |
| GET | /doctors | none | [{id, name, speciality}] |
| GET | /appointments | none | scoped by role. Patient: own. Doctor: assigned to them. |
| POST | /appointments | doctorId, date (ISO), reason | appointment |
| PATCH | /appointments/:id/status | status | appointment. Server enforces PENDING > CONFIRMED > COMPLETED |
| PATCH | /appointments/:id/notes | notes | appointment. Doctor only |
| GET | /admin/users | none | [{id, name, email, role, active}] |
| PATCH | /admin/users/:id/active | active (bool) | user |
| POST | /chat | message | { reply } |

Appointment shape: `{ id, doctorName, patientName, date, reason, status, notes }`
