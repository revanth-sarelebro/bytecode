const { z } = require("zod");

const createAppointmentSchema = z.object({
  doctorId: z
    .number()
    .int()
    .positive("Doctor ID must be a positive integer"),

  dateTime: z
    .string()
    .datetime({ offset: true }),

  reason: z
    .string()
    .trim()
    .max(500, "Reason must be at most 500 characters")
    .optional(),
});

const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
  ]),
});

module.exports = {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
};