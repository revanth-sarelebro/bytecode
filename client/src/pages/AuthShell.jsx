import Logo from '../components/Logo'

export default function AuthShell({ heading, children, footer }) {
  return (
    <div className="grid min-h-screen md:grid-cols-[5fr_4fr]">
      <aside className="hidden flex-col justify-between bg-clinic-dark p-12 text-white md:flex">
        <Logo />
        <p className="max-w-md font-display text-4xl font-bold leading-tight">
          Book the visit. Keep the notes. Spend the day on patients, not paperwork.
        </p>
        <p className="text-sm text-white/70">Demo build. All patient data shown is made up.</p>
      </aside>

      <main className="flex items-center px-6 py-12 md:px-14">
        <div className="w-full max-w-sm">
          <Logo className="mb-8 text-clinic md:hidden" />
          <h1 className="mb-6 text-3xl font-bold">{heading}</h1>
          {children}
          <p className="mt-6 text-sm text-muted">{footer}</p>
        </div>
      </main>
    </div>
  )
}
