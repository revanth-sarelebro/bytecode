export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-xl font-bold ${className}`}>
      <svg width="26" height="18" viewBox="0 0 26 18" aria-hidden="true">
        <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="17" cy="9" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.55" />
      </svg>
      MediSync
    </span>
  )
}
