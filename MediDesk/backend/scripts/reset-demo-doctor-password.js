require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("../src/utils/prisma");

const resetPassword = async () => {
  try {
    const email = "doctor@medidesk.demo";
    const password = "DoctorPass123!";

    const passwordHash = await bcrypt.hash(password, 12);

    const doctor = await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        role: "DOCTOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("Demo doctor password reset successfully:");
    console.log(doctor);
  } catch (error) {
    console.error("Failed to reset demo doctor password:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

resetPassword();