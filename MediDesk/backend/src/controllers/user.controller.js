const prisma = require("../utils/prisma");

const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        patientProfile: {
          select: {
            id: true,
            phone: true,
            dateOfBirth: true,
          },
        },
        doctorProfile: {
          select: {
            id: true,
            specialization: true,
            licenseNumber: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth } = req.body;

    if (
      name !== undefined &&
      (typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters",
      });
    }

    if (
      phone !== undefined &&
      (typeof phone !== "string" || phone.length > 30)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    if (
      dateOfBirth !== undefined &&
      (typeof dateOfBirth !== "string" || dateOfBirth.length > 20)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth",
      });
    }

    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(req.user.role === "PATIENT" && {
          patientProfile: {
            upsert: {
              create: {
                phone: phone ?? null,
                dateOfBirth: dateOfBirth ?? null,
              },
              update: {
                ...(phone !== undefined && { phone }),
                ...(dateOfBirth !== undefined && { dateOfBirth }),
              },
            },
          },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        patientProfile: {
          select: {
            id: true,
            phone: true,
            dateOfBirth: true,
          },
        },
        doctorProfile: {
          select: {
            id: true,
            specialization: true,
            licenseNumber: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};