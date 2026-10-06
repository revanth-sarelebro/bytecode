const { z } = require("zod");

const createMedicationSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2, "Enter the medicine name").max(80, "Name is too long"),
  dosage: z.string().trim().min(1, "Enter the dose").max(60, "Dose is too long"),
  frequency: z.string().trim().min(2, "Enter how often").max(80, "Frequency is too long"),
  durationDays: z.coerce.number().int("Use whole days").min(1, "At least 1 day").max(365, "At most 365 days"),
  notes: z.string().trim().max(300, "Keep notes under 300 characters").default(""),
});

module.exports = { createMedicationSchema };
