import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import ChatWidget from './ChatWidget'

const ROLE_TEXT = { PATIENT: 'Patient', DOCTOR: 'Doctor', ADMIN: 'Administrator' }

export default function Layout({ title, intro, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const signOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Logo className="text-clinic" />
          <div className="flex items-center gap-4 text-sm">
            <span>
              <span className="font-semibold">{user.name}</span>
              <span className="text-muted"> · {ROLE_TEXT[user.role]}</span>
            </span>
            <button onClick={signOut} className="btn-quiet gap-1.5">
              <LogOut size={14} aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        {intro && <p className="mt-1 max-w-xl text-muted">{intro}</p>}
        <div className="mt-8">{children}</div>
      </main>

      {user.role === 'PATIENT' && <ChatWidget />}
    </div>
  )
}
