const { z } = require("zod");

const createDoctorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email is too long")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),

  specialization: z
    .string()
    .trim()
    .min(2, "Specialization must be at least 2 characters")
    .max(100, "Specialization must be at most 100 characters"),

  licenseNumber: z
    .string()
    .trim()
    .max(100, "License number must be at most 100 characters")
    .optional(),
});

module.exports = {
  createDoctorSchema,
};