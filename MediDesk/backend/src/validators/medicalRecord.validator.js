const { z } = require("zod");

const createMedicalRecordSchema = z.object({
  patientId: z
    .number()
    .int()
    .positive("Patient ID must be a positive integer"),

  diagnosis: z
    .string()
    .trim()
    .min(1, "Diagnosis is required")
    .max(2000, "Diagnosis must be at most 2000 characters"),

  prescription: z
    .string()
    .trim()
    .max(5000, "Prescription must be at most 5000 characters")
    .optional(),
});

module.exports = {
  createMedicalRecordSchema,
};