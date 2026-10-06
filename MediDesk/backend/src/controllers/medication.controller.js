const prisma = require("../utils/prisma");
const { createMedicationSchema } = require("../validators/medication.validator");
const { doctorTreatsPatient } = require("../utils/treatment");

const DAY_MS = 24 * 60 * 60 * 1000;
const include = { doctor: { select: { name: true } } };

// status is worked out from startDate + durationDays.
const toDto = (m) => {
  const endsAt = new Date(m.startDate).getTime() + m.durationDays * DAY_MS;
  return {
    id: m.id,
    patientId: m.patientId,
    doctorId: m.doctorId,
    doctorName: m.doctor ? m.doctor.name : "",
    name: m.name,
    dosage: m.dosage,
    frequency: m.frequency,
    durationDays: m.durationDays,
    startDate: m.startDate,
    notes: m.notes || "",
    status: Date.now() < endsAt ? "ACTIVE" : "FINISHED",
  };
};

const createMedication = async (req, res) => {
  try {
    const result = createMedicationSchema.safeParse(req.body);

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

    const { patientId, name, dosage, frequency, durationDays, notes } = result.data;

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
        message: "You are not authorized to prescribe for this patient",
      });
    }

    const medication = await prisma.medication.create({
      data: {
        patientId,
        doctorId: req.user.id,
        name,
        dosage,
        frequency,
        durationDays,
        notes: notes || null,
      },
      include,
    });

    return res.status(201).json(toDto(medication));
  } catch (error) {
    console.error("Create medication error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Patients see their own medicines. Doctors see medicines they prescribed.
const getMyMedications = async (req, res) => {
  try {
    const where =
      req.user.role === "PATIENT" ? { patientId: req.user.id } : { doctorId: req.user.id };

    const medications = await prisma.medication.findMany({
      where,
      include,
      orderBy: { startDate: "desc" },
    });

    return res.status(200).json(medications.map(toDto));
  } catch (error) {
    console.error("Get medications error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPatientMedications = async (req, res) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid patient ID" });
    }

    if (!(await doctorTreatsPatient(req.user.id, patientId))) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this patient's medications",
      });
    }

    const medications = await prisma.medication.findMany({
      where: { patientId },
      include,
      orderBy: { startDate: "desc" },
    });

    return res.status(200).json(medications.map(toDto));
  } catch (error) {
    console.error("Get patient medications error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { createMedication, getMyMedications, getPatientMedications };
