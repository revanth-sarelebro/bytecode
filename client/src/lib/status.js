// Workflow order is enforced by the server too. This only decides which buttons to show.
export const NEXT_STATUS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

export const STATUS_LABEL = {
  PENDING: 'Waiting for confirmation',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const ACTION_LABEL = {
  CONFIRMED: 'Confirm',
  COMPLETED: 'Mark completed',
  CANCELLED: 'Cancel',
}

export const HOME = { PATIENT: '/patient', DOCTOR: '/doctor', ADMIN: '/admin' }

export const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
