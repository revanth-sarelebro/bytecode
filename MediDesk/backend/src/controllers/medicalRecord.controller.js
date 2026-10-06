const prisma = require("../utils/prisma");
const {
  createMedicalRecordSchema,
} = require("../validators/medicalRecord.validator");

const createMedicalRecord = async (req, res) => {
  try {
    const result = createMedicalRecordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { patientId, diagnosis, prescription } = result.data;

    // Verify that the patient exists and is actually a patient.
    const patient = await prisma.user.findFirst({
      where: {
        id: patientId,
        role: "PATIENT",
      },
      select: {
        id: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Security check:
    // The doctor must have an appointment with this patient.
    const doctorPatientAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: req.user.id,
        patientId,
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
      select: {
        id: true,
      },
    });

    if (!doctorPatientAppointment) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a record for this patient",
      });
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId,
        doctorId: req.user.id,
        diagnosis,
        prescription: prescription ?? null,
      },
      select: {
        id: true,
        patientId: true,
        doctorId: true,
        diagnosis: true,
        prescription: true,
        date: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      medicalRecord,
    });
  } catch (error) {
    console.error("Create medical record error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMyMedicalRecords = async (req, res) => {
  try {
    let where;

    if (req.user.role === "PATIENT") {
      // Patients can see only their own records.
      where = {
        patientId: req.user.id,
      };
    } else if (req.user.role === "DOCTOR") {
      // Doctors can see only records they created.
      where = {
        doctorId: req.user.id,
      };
    } else {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access medical records",
      });
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        patientId: true,
        doctorId: true,
        diagnosis: true,
        prescription: true,
        date: true,
      },
    });

    return res.status(200).json({
      success: true,
      medicalRecords,
    });
  } catch (error) {
    console.error("Get medical records error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createMedicalRecord,
  getMyMedicalRecords,
};