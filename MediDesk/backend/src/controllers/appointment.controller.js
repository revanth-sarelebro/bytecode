const prisma = require("../utils/prisma");
const {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} = require("../validators/appointment.validator");

const createAppointment = async (req, res) => {
  try {
    const result = createAppointmentSchema.safeParse(req.body);

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

    const { doctorId, dateTime, reason } = result.data;

    // Verify that the selected user exists and is actually a doctor.
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        role: "DOCTOR",
      },
      select: {
        id: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.id,
        doctorId,
        dateTime: new Date(dateTime),
        reason: reason ?? null,
        status: "PENDING",
      },
      select: {
        id: true,
        patientId: true,
        doctorId: true,
        dateTime: true,
        status: true,
        reason: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { patientId: req.user.id },
          { doctorId: req.user.id },
        ],
      },
      orderBy: {
        dateTime: "asc",
      },
      select: {
        id: true,
        patientId: true,
        doctorId: true,
        dateTime: true,
        status: true,
        reason: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const appointmentId = Number(req.params.id);

    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const result = updateAppointmentStatusSchema.safeParse(req.body);

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

    const { status } = result.data;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      select: {
        id: true,
        patientId: true,
        doctorId: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Only the assigned doctor can change appointment status.
    if (appointment.doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned doctor can update this appointment",
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status,
      },
      select: {
        id: true,
        patientId: true,
        doctorId: true,
        dateTime: true,
        status: true,
        reason: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
};