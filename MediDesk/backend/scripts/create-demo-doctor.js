require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("../src/utils/prisma");

const createDemoDoctor = async () => {
  try {
    const email = "doctor@medidesk.demo";
    const password = "DoctorPass123!";

    const existingDoctor = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingDoctor) {
      console.log("Demo doctor already exists.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const doctor = await prisma.user.create({
      data: {
        name: "Dr. Demo",
        email,
        passwordHash,
        role: "DOCTOR",
        doctorProfile: {
          create: {
            specialization: "General Medicine",
            licenseNumber: "DEMO-LICENSE-001",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        doctorProfile: {
          select: {
            specialization: true,
            licenseNumber: true,
          },
        },
      },
    });

    console.log("Demo doctor created successfully:");
    console.log(doctor);
  } catch (error) {
    console.error("Failed to create demo doctor:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

createDemoDoctor();