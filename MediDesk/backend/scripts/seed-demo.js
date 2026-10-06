// MediDesk demo seed. Run from MediDesk\backend:  node scripts\seed-demo.js
// Adds fake admin, doctors, patients, appointments and medical records.
// Safe to run twice: existing emails / booking codes are skipped.
// All demo emails end with @demo.test so they are easy to find and delete.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const PASSWORD = 'Demo@12345';

const admins = [{ name: 'Asha Admin', email: 'admin@demo.test' }];

const doctors = [
  { name: 'Dr. Meera Sharma', email: 'dr.sharma@demo.test', specialization: 'Cardiology', license: 'DEMO-LIC-1001' },
  { name: 'Dr. Arjun Reddy', email: 'dr.reddy@demo.test', specialization: 'General Medicine', license: 'DEMO-LIC-1002' },
  { name: 'Dr. Sana Khan', email: 'dr.khan@demo.test', specialization: 'Dermatology', license: 'DEMO-LIC-1003' },
];

const patients = [
  { name: 'Ravi Kumar', email: 'ravi@demo.test', phone: '+1-555-0101', dob: '1988-03-14' },
  { name: 'Priya Nair', email: 'priya@demo.test', phone: '+1-555-0102', dob: '1992-11-02' },
  { name: 'Karan Mehta', email: 'karan@demo.test', phone: '+1-555-0103', dob: '1975-07-21' },
  { name: 'Lakshmi Iyer', email: 'lakshmi@demo.test', phone: '+1-555-0104', dob: '1960-01-30' },
  { name: 'Neha Verma', email: 'neha@demo.test', phone: '+1-555-0105', dob: '2000-09-09' },
];

// daysFromNow: negative = past, positive = future
const appointments = [
  { code: 'DEMO-0001', patient: 'ravi@demo.test', doctor: 'dr.sharma@demo.test', days: -14, hour: 10, status: 'COMPLETED', reason: 'Chest discomfort follow-up' },
  { code: 'DEMO-0002', patient: 'priya@demo.test', doctor: 'dr.reddy@demo.test', days: -7, hour: 11, status: 'COMPLETED', reason: 'Fever and sore throat' },
  { code: 'DEMO-0003', patient: 'karan@demo.test', doctor: 'dr.sharma@demo.test', days: -3, hour: 15, status: 'COMPLETED', reason: 'Blood pressure review' },
  { code: 'DEMO-0004', patient: 'lakshmi@demo.test', doctor: 'dr.reddy@demo.test', days: 0, hour: 9, status: 'CHECKED_IN', reason: 'Diabetes check-up' },
  { code: 'DEMO-0005', patient: 'neha@demo.test', doctor: 'dr.khan@demo.test', days: 0, hour: 14, status: 'IN_PROGRESS', reason: 'Skin rash' },
  { code: 'DEMO-0006', patient: 'ravi@demo.test', doctor: 'dr.reddy@demo.test', days: 2, hour: 10, status: 'CONFIRMED', reason: 'Annual physical' },
  { code: 'DEMO-0007', patient: 'priya@demo.test', doctor: 'dr.khan@demo.test', days: 5, hour: 16, status: 'PENDING', reason: 'Acne consultation' },
  { code: 'DEMO-0008', patient: 'karan@demo.test', doctor: 'dr.sharma@demo.test', days: -10, hour: 12, status: 'CANCELLED', reason: 'ECG appointment' },
];

// These act as "reports": diagnosis + prescription per visit
const records = [
  { patient: 'ravi@demo.test', doctor: 'dr.sharma@demo.test', daysAgo: 14, diagnosis: 'Mild angina, stable', prescription: 'Aspirin 75 mg daily; avoid heavy exertion; recheck in 4 weeks' },
  { patient: 'priya@demo.test', doctor: 'dr.reddy@demo.test', daysAgo: 7, diagnosis: 'Viral pharyngitis', prescription: 'Paracetamol 500 mg as needed; warm fluids; rest 3 days' },
  { patient: 'karan@demo.test', doctor: 'dr.sharma@demo.test', daysAgo: 3, diagnosis: 'Hypertension stage 1', prescription: 'Amlodipine 5 mg daily; reduce salt; BP log twice daily' },
  { patient: 'lakshmi@demo.test', doctor: 'dr.reddy@demo.test', daysAgo: 60, diagnosis: 'Type 2 diabetes, controlled', prescription: 'Metformin 500 mg twice daily; HbA1c test every 3 months' },
  { patient: 'neha@demo.test', doctor: 'dr.khan@demo.test', daysAgo: 30, diagnosis: 'Contact dermatitis', prescription: 'Hydrocortisone 1% cream twice daily for 7 days' },
  { patient: 'ravi@demo.test', doctor: 'dr.reddy@demo.test', daysAgo: 120, diagnosis: 'Seasonal allergic rhinitis', prescription: 'Cetirizine 10 mg at night during pollen season' },
];

function atHour(daysFromNow, hour) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
}

async function upsertUser(c, u, role, hash) {
  await c.query(
    'INSERT INTO "User"(name, email, "passwordHash", role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
    [u.name, u.email, hash, role]
  );
  const r = await c.query('SELECT id FROM "User" WHERE email = $1', [u.email]);
  return r.rows[0].id;
}

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const ids = {};

  try {
    await c.query('BEGIN');
    const hash = bcrypt.hashSync(PASSWORD, 10);

    for (const a of admins) {
      ids[a.email] = await upsertUser(c, a, 'ADMIN', hash);
    }

    for (const d of doctors) {
      const id = await upsertUser(c, d, 'DOCTOR', hash);
      ids[d.email] = id;
      await c.query(
        'INSERT INTO "DoctorProfile"("userId", specialization, "licenseNumber") VALUES ($1, $2, $3) ON CONFLICT ("userId") DO NOTHING',
        [id, d.specialization, d.license]
      );
    }

    for (const p of patients) {
      const id = await upsertUser(c, p, 'PATIENT', hash);
      ids[p.email] = id;
      await c.query(
        'INSERT INTO "PatientProfile"("userId", phone, "dateOfBirth") VALUES ($1, $2, $3) ON CONFLICT ("userId") DO NOTHING',
        [id, p.phone, p.dob]
      );
    }

    for (const a of appointments) {
      const when = atHour(a.days, a.hour);
      const checkedIn = ['CHECKED_IN', 'IN_PROGRESS', 'COMPLETED'].includes(a.status) ? when.toISOString() : null;
      await c.query(
        'INSERT INTO "Appointment"("patientId", "doctorId", "dateTime", status, reason, "bookingCode", "checkedInAt") VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT ("bookingCode") DO NOTHING',
        [ids[a.patient], ids[a.doctor], when.toISOString(), a.status, a.reason, a.code, checkedIn]
      );
    }

    for (const r of records) {
      const when = atHour(-r.daysAgo, 10);
      await c.query(
        `INSERT INTO "MedicalRecord"("patientId", "doctorId", diagnosis, prescription, "date")
         SELECT $1::int, $2::int, $3::text, $4::text, $5::timestamp
         WHERE NOT EXISTS (
           SELECT 1 FROM "MedicalRecord"
           WHERE "patientId" = $1::int AND "doctorId" = $2::int AND diagnosis = $3::text
         )`,
        [ids[r.patient], ids[r.doctor], r.diagnosis, r.prescription, when.toISOString()]
      );
    }

    await c.query('COMMIT');

    console.log('Seed done. Demo logins (password for all: ' + PASSWORD + '):');
    console.log('  Admin:   ' + admins.map(a => a.email).join(', '));
    console.log('  Doctors: ' + doctors.map(d => d.email).join(', '));
    console.log('  Patients: ' + patients.map(p => p.email).join(', '));
  } catch (e) {
    await c.query('ROLLBACK');
    console.error('Seed failed, nothing was saved:', e.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
