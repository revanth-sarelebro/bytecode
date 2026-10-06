# MediSync frontend

React + Vite + Tailwind. Lives in `MediDesk/frontend`, next to `MediDesk/backend`.

## Run

    cd frontend
    npm install
    copy .env.example .env     (PowerShell: Copy-Item .env.example .env)
    npm run dev

`.env`: `VITE_API_BASE_URL=http://localhost:5000/api`

## Matching the backend

All routes the frontend calls are listed in `src/services/endpoints.js`.
If a backend route is named differently, change it there only.

| Backend area | Frontend calls | Method |
|---|---|---|
| auth | /auth/login, /auth/verify-otp, /auth/resend-otp, /auth/register, /auth/me | POST, POST, POST, POST, GET |
| user | /users/me | PATCH |
| doctor | /doctors | GET |
| appointment | /appointments, /appointments/:id/status, /appointments/:id/notes | GET, POST, PATCH |
| medicalRecord | /medical-records, /medical-records/patient/:id | GET, POST |
| admin | /admin/users, /admin/users/:id/active, /admin/appointments, /admin/doctors, /admin/audit | GET, PATCH, POST |
| reports | /reports, /reports/patient/:id | GET, POST |
| medications | /medications, /medications/patient/:id | GET, POST |
| ai | /ai/chat | POST |

## Response shapes the UI expects

- Register: `{ token, user: { id, name, email, role, phone?, dateOfBirth?, bloodGroup? } }`. Role is `PATIENT`, `DOCTOR` or `ADMIN`.
- Login (step 1): `{ otpRequired: true, challengeId, expiresInSeconds }`. No token yet. (If the server skips OTP it may return `{ token, user }` and the UI still works.)
- Verify OTP (step 2): body `{ challengeId, code }`, returns `{ token, user }`. Wrong or expired code: 401. Too many tries: 429.
- Resend OTP: body `{ challengeId }`, returns a fresh `{ challengeId, expiresInSeconds }`.
- Report: `{ id, type, title, createdAt, doctorName, results: [{ name, value, unit, low, high }], findings, impression }`. Type is `BLOOD_TEST`, `XRAY`, `SCAN` or `OTHER`.
- Medication: `{ id, name, dosage, frequency, durationDays, startDate, notes, doctorName, status }`. Status is `ACTIVE` or `COMPLETED`.
- Appointment: `{ id, patientId, patientName, doctorName, date, reason, status, notes }`. Status is `PENDING`, `CONFIRMED`, `COMPLETED` or `CANCELLED`.
- Doctor list item: `{ id, name, speciality }`.
- Medical record: `{ id, doctorName, diagnosis, prescriptions, createdAt }`.
- Admin user: `{ id, name, email, role, active }`.
- Audit entry: `{ id, actorName, actorRole, action, target, createdAt }`.
- AI chat: `{ reply }`.

## Rules the server must enforce (the UI only hides things)

- OTP: 6 digits, random, expires in 5 minutes, single use, max 5 tries, stored hashed. Never return the code in the response.
- No session or token is issued until the OTP is verified.
- Patients read only their own reports and medications. Doctors only for patients they have an appointment with.

- Self-registration always creates a PATIENT. Never read role from the request body.
- Patients read only their own records and appointments.
- A doctor reads only records of patients they have an appointment with.
- Status order is PENDING, CONFIRMED, COMPLETED. CANCELLED allowed from the first two.
- CORS allows `http://localhost:5173` and the Vercel URL.

## Run without a backend (mock mode)

Set `VITE_USE_MOCK=true` in `.env`, then restart `npm run dev`.
All data is fake and stored in the browser. Set it back to `false` to use the real API.

Accounts (password `Test1234`):
- After the password, the OTP screen shows the code on screen (mock mode only).
- patient@test.com (Asha Reddy), patient2@test.com
- doctor@test.com (Dr. Meera Iyer), doctor2@test.com
- admin@test.com
