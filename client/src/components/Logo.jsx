export function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 740 740" aria-hidden="true">
      <defs>
        <linearGradient id="ms-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBE096" />
          <stop offset="1" stopColor="#E39E40" />
        </linearGradient>
      </defs>
      <rect width="740" height="740" rx="190" fill="url(#ms-grad)" />
      <g fill="#4A3522">
        <rect x="338" y="264" width="74" height="222" />
        <rect x="264" y="338" width="222" height="74" />
      </g>
      <g fill="none" stroke="#fff" strokeWidth="45" strokeLinecap="round">
        <path d="M375 125 A250 250 0 0 1 591 250" />
        <path d="M159 500 A250 250 0 0 0 375 625" />
      </g>
    </svg>
  )
}

export default function Logo({ className = '', size = 30 }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display text-xl font-bold ${className}`}>
      <LogoMark size={size} />
      MediSync
    </span>
  )
}
