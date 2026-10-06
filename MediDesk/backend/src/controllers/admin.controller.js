const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { createDoctorSchema } = require("../validators/admin.validator");

const createDoctor = async (req, res) => {
  try {
    const result = createDoctorSchema.safeParse(req.body);

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

    const {
      name,
      email,
      password,
      specialization,
      licenseNumber,
    } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const doctor = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "DOCTOR",
        doctorProfile: {
          create: {
            specialization,
            licenseNumber: licenseNumber ?? null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        doctorProfile: {
          select: {
            id: true,
            specialization: true,
            licenseNumber: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Doctor account created successfully",
      doctor,
    });
  } catch (error) {
    console.error("Create doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        patientProfile: {
          select: {
            phone: true,
            dateOfBirth: true,
          },
        },
        doctorProfile: {
          select: {
            specialization: true,
            licenseNumber: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        dateTime: "desc",
      },
      select: {
        id: true,
        patientId: true,
        doctorId: true,
        dateTime: true,
        status: true,
        reason: true,
        createdAt: true,
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Get admin appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createDoctor,
  getUsers,
  getAppointments,
};