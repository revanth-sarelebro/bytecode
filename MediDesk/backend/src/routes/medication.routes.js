const express = require("express");

const {
  createMedication,
  getMyMedications,
  getPatientMedications,
} = require("../controllers/medication.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");

const router = express.Router();

// Only doctors can prescribe.
router.post("/", authenticate, requireRole("DOCTOR"), createMedication);

// Patients see their own medicines; doctors see the ones they prescribed.
router.get("/", authenticate, requireRole("PATIENT", "DOCTOR"), getMyMedications);

// Doctors can read medicines for patients they treat.
router.get("/patient/:patientId", authenticate, requireRole("DOCTOR"), getPatientMedications);

module.exports = router;
