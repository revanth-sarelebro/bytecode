const express = require("express");

const {
  createDoctor,
  getUsers,
  getAppointments,
} = require("../controllers/admin.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");

const router = express.Router();

// Only admins can create doctor accounts.
router.post(
  "/doctors",
  authenticate,
  requireRole("ADMIN"),
  createDoctor
);

// Only admins can view all users.
router.get(
  "/users",
  authenticate,
  requireRole("ADMIN"),
  getUsers
);

// Only admins can view all appointments.
router.get(
  "/appointments",
  authenticate,
  requireRole("ADMIN"),
  getAppointments
);

module.exports = router;