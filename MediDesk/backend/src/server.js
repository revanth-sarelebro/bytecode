require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const prisma = require("./utils/prisma");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const medicalRecordRoutes = require("./routes/medicalRecord.routes");
const adminRoutes = require("./routes/admin.routes");
const doctorRoutes = require("./routes/doctor.routes");
const reportRoutes = require("./routes/report.routes");
const medicationRoutes = require("./routes/medication.routes");


const app = express();
app.set('trust proxy', 1);

app.use(helmet());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((s) => s.trim().replace(/\/$/, ""))
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy: origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/medications", medicationRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "MediDesk backend is running",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (err.message?.startsWith("CORS policy:")) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MediDesk backend running on http://localhost:${PORT}`);
});