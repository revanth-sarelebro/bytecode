const { z } = require("zod");

const resultSchema = z.object({
  name: z.string().trim().min(1, "Result name is required").max(80, "Result name is too long"),
  value: z.coerce.string().trim().min(1, "Result value is required").max(30, "Result value is too long"),
  unit: z.string().trim().max(30, "Unit is too long").default(""),
  low: z.coerce.number(),
  high: z.coerce.number(),
});

const createReportSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  type: z.enum(["BLOOD_TEST", "XRAY", "SCAN", "OTHER"]),
  title: z.string().trim().min(3, "Enter a report title").max(100, "Title is too long"),
  results: z.array(resultSchema).max(60, "Too many result lines").default([]),
  findings: z.string().trim().max(1500, "Keep findings under 1500 characters").default(""),
  impression: z.string().trim().max(500, "Keep the impression under 500 characters").default(""),
});

module.exports = { createReportSchema };
