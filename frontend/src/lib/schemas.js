import { z } from 'zod'

// Client-side checks are for UX only. Server must re-validate everything.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/[0-9]/, 'Include at least one number'),
})

export const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Choose a doctor'),
  date: z
    .string()
    .min(1, 'Pick a date and time')
    .refine((v) => new Date(v).getTime() > Date.now(), 'Pick a time in the future'),
  reason: z.string().trim().min(5, 'Tell the doctor a bit more').max(300, 'Keep it under 300 characters'),
})

export const notesSchema = z.object({
  notes: z.string().trim().max(1000, 'Notes are limited to 1000 characters'),
})

export const chatSchema = z.object({
  message: z.string().trim().min(1).max(300),
})

// Returns { data } or { errors: { field: message } }
export function validate(schema, values) {
  const result = schema.safeParse(values)
  if (result.success) return { data: result.data }
  const errors = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] ?? 'form'
    if (!errors[key]) errors[key] = issue.message
  }
  return { errors }
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80, 'Name is too long'),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number').or(z.literal('')),
  dateOfBirth: z
    .string()
    .refine((v) => v === '' || new Date(v).getTime() < Date.now(), 'Date of birth must be in the past'),
  bloodGroup: z.enum(BLOOD_GROUPS).or(z.literal('')),
})

export const recordSchema = z.object({
  diagnosis: z.string().trim().min(3, 'Enter a diagnosis').max(500, 'Keep it under 500 characters'),
  prescriptions: z.string().trim().max(500, 'Keep it under 500 characters'),
})

export const doctorSchema = z.object({
  name: z.string().trim().min(2, 'Enter the doctor name').max(80, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  speciality: z.string().trim().min(2, 'Enter a speciality').max(60, 'Too long'),
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/[0-9]/, 'Include at least one number'),
})

export const otpSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
})

export const REPORT_TYPE_KEYS = ['BLOOD_TEST', 'XRAY', 'SCAN', 'OTHER']

export const reportSchema = z.object({
  type: z.enum(REPORT_TYPE_KEYS),
  title: z.string().trim().min(3, 'Enter a report title').max(100, 'Title is too long'),
  resultsText: z.string().max(2000, 'Too long'),
  findings: z.string().trim().max(1500, 'Keep findings under 1500 characters'),
  impression: z.string().trim().max(500, 'Keep the impression under 500 characters'),
})

export const medicationSchema = z.object({
  name: z.string().trim().min(2, 'Enter the medicine name').max(80, 'Name is too long'),
  dosage: z.string().trim().min(1, 'Enter the dose').max(60, 'Too long'),
  frequency: z.string().trim().min(2, 'Enter how often').max(80, 'Too long'),
  durationDays: z.coerce.number({ invalid_type_error: 'Enter a number of days' }).int('Use whole days').min(1, 'At least 1 day').max(365, 'At most 365 days'),
  notes: z.string().trim().max(300, 'Keep notes under 300 characters'),
})
