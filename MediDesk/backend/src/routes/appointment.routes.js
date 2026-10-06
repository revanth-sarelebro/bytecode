const express = require("express");

const {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointment.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");

const router = express.Router();

// Patient creates an appointment with a doctor
router.post(
  "/",
  authenticate,
  requireRole("PATIENT"),
  createAppointment
);

// Patient or doctor can view only their own appointments
router.get(
  "/my",
  authenticate,
  requireRole("PATIENT", "DOCTOR"),
  getMyAppointments
);

// Only the assigned doctor can change appointment status
router.patch(
  "/:id/status",
  authenticate,
  requireRole("DOCTOR"),
  updateAppointmentStatus
);

module.exports = router;