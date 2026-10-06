// Demo reports and medications for the @demo.test patients.
// Run from MediDesk\backend AFTER scripts\seed-demo.js:  node scripts\seed-reports-meds.js
// Safe to run twice: rows that already exist are skipped.

require("dotenv").config();
const { Client } = require("pg");

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY_MS).toISOString();

const SHARMA = "dr.sharma@demo.test";
const REDDY = "dr.reddy@demo.test";
const KHAN = "dr.khan@demo.test";

const reports = [
  {
    patient: "ravi@demo.test", doctor: SHARMA, type: "BLOOD_TEST", title: "Lipid profile", ago: 14,
    results: [
      { name: "Total cholesterol", value: "218", unit: "mg/dL", low: 0, high: 200 },
      { name: "LDL cholesterol", value: "142", unit: "mg/dL", low: 0, high: 130 },
      { name: "HDL cholesterol", value: "48", unit: "mg/dL", low: 40, high: 100 },
      { name: "Triglycerides", value: "135", unit: "mg/dL", low: 0, high: 150 },
    ],
    findings: "Total cholesterol and LDL are above the reference range. HDL and triglycerides are normal.",
    impression: "Mildly raised cholesterol. Change diet and repeat the test in eight weeks.",
  },
  {
    patient: "ravi@demo.test", doctor: SHARMA, type: "XRAY", title: "Chest X-ray (front view)", ago: 13,
    results: [],
    findings: "Both lungs are clear. No fluid or collapse. Heart size is normal.",
    impression: "No acute abnormality seen.",
  },
  {
    patient: "priya@demo.test", doctor: REDDY, type: "BLOOD_TEST", title: "Complete blood count", ago: 7,
    results: [
      { name: "Hemoglobin", value: "12.4", unit: "g/dL", low: 12, high: 16 },
      { name: "White blood cells", value: "12.6", unit: "10^3/uL", low: 4, high: 11 },
      { name: "Platelets", value: "280", unit: "10^3/uL", low: 150, high: 400 },
    ],
    findings: "White cell count is slightly raised, which fits a viral or bacterial infection.",
    impression: "Mild infection pattern. Repeat the test if symptoms continue.",
  },
  {
    patient: "karan@demo.test", doctor: SHARMA, type: "BLOOD_TEST", title: "Kidney function and electrolytes", ago: 3,
    results: [
      { name: "Creatinine", value: "1.1", unit: "mg/dL", low: 0.7, high: 1.3 },
      { name: "Urea", value: "38", unit: "mg/dL", low: 15, high: 45 },
      { name: "Sodium", value: "139", unit: "mmol/L", low: 135, high: 145 },
      { name: "Potassium", value: "4.2", unit: "mmol/L", low: 3.5, high: 5 },
    ],
    findings: "All values are within the reference range.",
    impression: "Normal kidney function. Safe to continue blood pressure treatment.",
  },
  {
    patient: "karan@demo.test", doctor: SHARMA, type: "SCAN", title: "Echocardiogram", ago: 2,
    results: [],
    findings: "Normal chamber sizes. Pumping strength is normal at about 60 percent. Mild thickening of the left ventricle wall.",
    impression: "Fits long-standing high blood pressure. No sign of heart failure.",
  },
  {
    patient: "lakshmi@demo.test", doctor: REDDY, type: "BLOOD_TEST", title: "Diabetes review", ago: 30,
    results: [
      { name: "HbA1c", value: "7.2", unit: "%", low: 4, high: 5.6 },
      { name: "Fasting glucose", value: "138", unit: "mg/dL", low: 70, high: 100 },
      { name: "Creatinine", value: "0.9", unit: "mg/dL", low: 0.6, high: 1.1 },
    ],
    findings: "HbA1c and fasting glucose are above target. Kidney function is normal.",
    impression: "Diabetes not fully controlled. Review diet and adjust treatment.",
  },
  {
    patient: "neha@demo.test", doctor: KHAN, type: "OTHER", title: "Skin patch test summary", ago: 1,
    results: [],
    findings: "Mild reaction to nickel. No reaction to fragrance mix or latex.",
    impression: "Nickel contact allergy is the likely cause of the rash.",
  },
];

const meds = [
  { patient: "ravi@demo.test", doctor: SHARMA, name: "Aspirin", dosage: "75 mg", frequency: "Once daily after food", days: 60, ago: 14, notes: "Take with food. Report any black stools." },
  { patient: "ravi@demo.test", doctor: SHARMA, name: "Atorvastatin", dosage: "10 mg", frequency: "Once daily at night", days: 90, ago: 13, notes: "Avoid grapefruit juice." },
  { patient: "ravi@demo.test", doctor: REDDY, name: "Cetirizine", dosage: "10 mg", frequency: "Once at night", days: 14, ago: 120, notes: "May cause drowsiness." },
  { patient: "priya@demo.test", doctor: REDDY, name: "Paracetamol", dosage: "500 mg", frequency: "Every 8 hours when needed", days: 5, ago: 7, notes: "Do not take more than 3 doses in a day." },
  { patient: "priya@demo.test", doctor: REDDY, name: "Vitamin D3", dosage: "1000 IU", frequency: "Once daily", days: 60, ago: 5, notes: "Take after breakfast." },
  { patient: "karan@demo.test", doctor: SHARMA, name: "Amlodipine", dosage: "5 mg", frequency: "Once daily", days: 90, ago: 3, notes: "Check blood pressure twice daily and keep a log." },
  { patient: "lakshmi@demo.test", doctor: REDDY, name: "Metformin", dosage: "500 mg", frequency: "Twice daily after meals", days: 180, ago: 60, notes: "Take with food to avoid stomach upset." },
  { patient: "neha@demo.test", doctor: KHAN, name: "Hydrocortisone 1% cream", dosage: "Thin layer", frequency: "Twice daily on the rash", days: 7, ago: 3, notes: "Do not use on the face." },
  { patient: "neha@demo.test", doctor: KHAN, name: "Fragrance-free emollient", dosage: "As needed", frequency: "After bathing", days: 30, ago: 1, notes: "" },
];

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  const idOf = async (email) => {
    const r = await c.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (!r.rows[0]) throw new Error("Missing user " + email + ". Run scripts\\seed-demo.js first.");
    return r.rows[0].id;
  };

  try {
    await c.query("BEGIN");
    let addedReports = 0;
    let addedMeds = 0;

    for (const r of reports) {
      const res = await c.query(
        'INSERT INTO "Report"("patientId", "doctorId", type, title, results, findings, impression, "createdAt") ' +
          'SELECT $1::int, $2::int, $3::"ReportType", $4::text, $5::jsonb, $6::text, $7::text, $8::timestamp ' +
          'WHERE NOT EXISTS (SELECT 1 FROM "Report" WHERE "patientId" = $1::int AND "doctorId" = $2::int AND title = $4::text)',
        [await idOf(r.patient), await idOf(r.doctor), r.type, r.title, JSON.stringify(r.results), r.findings, r.impression, daysAgo(r.ago)]
      );
      addedReports += res.rowCount;
    }

    for (const m of meds) {
      const res = await c.query(
        'INSERT INTO "Medication"("patientId", "doctorId", name, dosage, frequency, "durationDays", "startDate", notes) ' +
          'SELECT $1::int, $2::int, $3::text, $4::text, $5::text, $6::int, $7::timestamp, $8::text ' +
          'WHERE NOT EXISTS (SELECT 1 FROM "Medication" WHERE "patientId" = $1::int AND "doctorId" = $2::int AND name = $3::text)',
        [await idOf(m.patient), await idOf(m.doctor), m.name, m.dosage, m.frequency, m.days, daysAgo(m.ago), m.notes || null]
      );
      addedMeds += res.rowCount;
    }

    await c.query("COMMIT");
    console.log("Added " + addedReports + " reports and " + addedMeds + " medications.");
  } catch (e) {
    await c.query("ROLLBACK");
    console.error("Seed failed, nothing was saved:", e.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
