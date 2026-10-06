const express = require("express");

const {
  createReport,
  getMyReports,
  getPatientReports,
} = require("../controllers/report.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");

const router = express.Router();

// Only doctors can add reports.
router.post("/", authenticate, requireRole("DOCTOR"), createReport);

// Patients see their own reports; doctors see the ones they wrote.
router.get("/", authenticate, requireRole("PATIENT", "DOCTOR"), getMyReports);

// Doctors can read reports for patients they treat.
router.get("/patient/:patientId", authenticate, requireRole("DOCTOR"), getPatientReports);

module.exports = router;
