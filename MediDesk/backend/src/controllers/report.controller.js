const prisma = require("../utils/prisma");
const { createReportSchema } = require("../validators/report.validator");
const { doctorTreatsPatient } = require("../utils/treatment");

const include = { doctor: { select: { name: true } } };

// The frontend expects a flat object with doctorName.
const toDto = (r) => ({
  id: r.id,
  patientId: r.patientId,
  doctorId: r.doctorId,
  doctorName: r.doctor ? r.doctor.name : "",
  type: r.type,
  title: r.title,
  results: Array.isArray(r.results) ? r.results : [],
  findings: r.findings || "",
  impression: r.impression || "",
  createdAt: r.createdAt,
});

const createReport = async (req, res) => {
  try {
    const result = createReportSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { patientId, type, title, results, findings, impression } = result.data;

    const patient = await prisma.user.findFirst({
      where: { id: patientId, role: "PATIENT" },
      select: { id: true },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    if (!(await doctorTreatsPatient(req.user.id, patientId))) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to add a report for this patient",
      });
    }

    const report = await prisma.report.create({
      data: {
        patientId,
        doctorId: req.user.id,
        type,
        title,
        results,
        findings: findings || null,
        impression: impression || null,
      },
      include,
    });

    return res.status(201).json(toDto(report));
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Patients see their own reports. Doctors see reports they wrote.
const getMyReports = async (req, res) => {
  try {
    const where =
      req.user.role === "PATIENT" ? { patientId: req.user.id } : { doctorId: req.user.id };

    const reports = await prisma.report.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(reports.map(toDto));
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPatientReports = async (req, res) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid patient ID" });
    }

    if (!(await doctorTreatsPatient(req.user.id, patientId))) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this patient's reports",
      });
    }

    const reports = await prisma.report.findMany({
      where: { patientId },
      include,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(reports.map(toDto));
  } catch (error) {
    console.error("Get patient reports error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { createReport, getMyReports, getPatientReports };
