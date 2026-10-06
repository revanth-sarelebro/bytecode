import Logo from '../components/Logo'

// One colour per portal so people can tell at a glance which door they are using.
export const TONES = {
  patient: { panel: 'bg-clinic-dark', text: 'text-clinic', border: 'border-clinic', btn: '' },
  doctor: { panel: 'bg-slate-dark', text: 'text-slate', border: 'border-slate', btn: 'bg-slate hover:bg-slate-dark' },
  admin: { panel: 'bg-neutral-800', text: 'text-neutral-800', border: 'border-neutral-800', btn: 'bg-neutral-800 hover:bg-black' },
}

export default function AuthShell({ heading, children, footer, tone = 'patient' }) {
  const t = TONES[tone]
  return (
    <div className="grid min-h-screen md:grid-cols-[5fr_4fr]">
      <aside className={`relative hidden flex-col justify-between overflow-hidden p-12 text-white md:flex ${t.panel}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-[#E39E40]/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#FBE096]/15 blur-3xl" />
        <Logo size={36} />
        <p className="relative max-w-md font-display text-4xl font-bold leading-tight">
          Book the visit. Keep the notes. Spend the day on patients, not paperwork.
        </p>
        <span aria-hidden="true" className="relative" />
      </aside>

      <main className="flex items-center px-6 py-12 md:px-14">
        <div className="glass w-full max-w-sm p-8">
          <Logo className={`mb-8 md:hidden ${t.text}`} />
          <h1 className="mb-6 text-3xl font-bold">{heading}</h1>
          {children}
          <p className="mt-6 text-sm text-muted">{footer}</p>
        </div>
      </main>
    </div>
  )
}
