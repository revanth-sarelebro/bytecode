require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("../src/utils/prisma");

const createDemoAdmin = async () => {
  try {
    const email = "admin@medidesk.demo";
    const password = "AdminPass123!";

    const existingAdmin = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingAdmin) {
      console.log("Demo admin already exists.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name: "MediDesk Admin",
        email,
        passwordHash,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("Demo admin created successfully:");
    console.log(admin);
  } catch (error) {
    console.error("Failed to create demo admin:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

createDemoAdmin();