import { STATUS_LABEL } from '../lib/status'

const STYLE = {
  PENDING: 'bg-amber-soft text-amber',
  CONFIRMED: 'bg-slate-soft text-slate',
  COMPLETED: 'bg-clinic-soft text-clinic-dark',
  CANCELLED: 'bg-rose-soft text-rose',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-sm font-semibold ${STYLE[status] ?? 'bg-line'}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}
