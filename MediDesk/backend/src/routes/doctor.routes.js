const express = require("express");

const { getDoctors } = require("../controllers/doctor.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");

const router = express.Router();

// Only authenticated patients can view the doctor list
router.get(
  "/",
  authenticate,
  requireRole("PATIENT"),
  getDoctors
);

module.exports = router;