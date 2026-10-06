const express = require("express");

const {
  createMedicalRecord,
  getMyMedicalRecords,
  getPatientMedicalRecords,
} = require("../controllers/medicalRecord.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");

const router = express.Router();

// Only doctors can create medical records.
router.post(
  "/",
  authenticate,
  requireRole("DOCTOR"),
  createMedicalRecord
);

// Patients and doctors can retrieve their authorized records.
router.get(
  "/my",
  authenticate,
  requireRole("PATIENT", "DOCTOR"),
  getMyMedicalRecords
);
// Doctors can retrieve records for patients they have treated.
router.get(
  "/patient/:patientId",
  authenticate,
  requireRole("DOCTOR"),
  getPatientMedicalRecords
);

module.exports = router;