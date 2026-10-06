export const ACTION_TEXT = {
  LOGIN: 'Signed in',
  LOGIN_FAILED: 'Failed sign in',
  LOGOUT: 'Signed out',
  RECORD_VIEW: 'Viewed medical record',
  RECORD_CREATE: 'Added medical record',
  NOTES_UPDATE: 'Updated visit notes',
  APPOINTMENT_CREATE: 'Booked appointment',
  APPOINTMENT_STATUS: 'Changed appointment status',
  PROFILE_UPDATE: 'Updated profile',
  USER_DISABLED: 'Disabled account',
  USER_ENABLED: 'Enabled account',
  DOCTOR_CREATE: 'Added doctor',
  ACCESS_DENIED: 'Blocked: no permission',
  REPORT_VIEW: 'Viewed lab report',
  REPORT_CREATE: 'Added lab report',
  MEDICATION_CREATE: 'Prescribed medication',
}

export const actionText = (code) => ACTION_TEXT[code] ?? code

// Flag entries a reviewer should look at first
export const isAlert = (code) => code === 'LOGIN_FAILED' || code === 'ACCESS_DENIED'
