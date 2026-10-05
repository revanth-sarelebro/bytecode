import Logo from '../components/Logo'

// One colour per portal so people can tell at a glance which door they are using.
export const TONES = {
  patient: { panel: 'bg-clinic-dark', text: 'text-clinic', border: 'border-clinic', btn: '' },
  doctor: { panel: 'bg-slate-dark', text: 'text-slate', border: 'border-slate', btn: 'bg-slate hover:bg-slate-dark' },
  admin: { panel: 'bg-ink', text: 'text-ink', border: 'border-ink', btn: 'bg-ink hover:bg-black' },
}

export default function AuthShell({ heading, children, footer, tone = 'patient' }) {
  const t = TONES[tone]
  return (
    <div className="grid min-h-screen md:grid-cols-[5fr_4fr]">
      <aside className={`hidden flex-col justify-between p-12 text-white md:flex ${t.panel}`}>
        <Logo />
        <p className="max-w-md font-display text-4xl font-bold leading-tight">
          Book the visit. Keep the notes. Spend the day on patients, not paperwork.
        </p>
        <span aria-hidden="true" />
      </aside>

      <main className="flex items-center px-6 py-12 md:px-14">
        <div className="w-full max-w-sm">
          <Logo className={`mb-8 md:hidden ${t.text}`} />
          <h1 className="mb-6 text-3xl font-bold">{heading}</h1>
          {children}
          <p className="mt-6 text-sm text-muted">{footer}</p>
        </div>
      </main>
    </div>
  )
}
