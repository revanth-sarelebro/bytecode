const prisma = require("../utils/prisma");

const getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
      },
      select: {
        id: true,
        name: true,
        doctorProfile: {
          select: {
            specialization: true,
            licenseNumber: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const result = doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      speciality: doctor.doctorProfile?.specialization || "General Physician",
      licenseNumber: doctor.doctorProfile?.licenseNumber || null,
    }));

    return res.json({
      success: true,
      doctors: result,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

module.exports = {
  getDoctors,
};