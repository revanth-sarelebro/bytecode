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
