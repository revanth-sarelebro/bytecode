import { useState } from 'react'
import { Link, NavLink, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/api'
import { loginSchema, validate } from '../lib/schemas'
import { HOME } from '../lib/status'
import AuthShell from './AuthShell'
import Field from '../components/Field'

const PORTALS = {
  patient: { role: 'PATIENT', heading: 'Patient sign in', word: 'patient' },
  doctor: { role: 'DOCTOR', heading: 'Doctor sign in', word: 'doctor' },
  admin: { role: 'ADMIN', heading: 'Administrator sign in', word: 'administrator' },
}
const ROLE_WORD = { PATIENT: 'patient', DOCTOR: 'doctor', ADMIN: 'administrator' }

export default function Login() {
  const { portal: param } = useParams()
  const portalKey = PORTALS[param] ? param : 'patient'
  const portal = PORTALS[portalKey]

  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={HOME[user.role]} replace />

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setFormError('')
    const { data, errors } = validate(loginSchema, values)
    setErrors(errors ?? {})
    if (!data) return

    setBusy(true)
    try {
      const u = await login(data, portal.role)
      navigate(HOME[u.role], { replace: true })
    } catch (err) {
      if (err.actualRole) {
        setFormError(`This is a ${ROLE_WORD[err.actualRole]} account. Use the ${ROLE_WORD[err.actualRole]} sign in page.`)
      } else {
        setFormError(errorMessage(err))
      }
    } finally {
      setBusy(false)
    }
  }

  const tab = ({ isActive }) =>
    `flex-1 border-b-2 px-3 py-2 text-center font-semibold ${isActive ? 'border-clinic text-clinic' : 'border-line text-muted hover:text-ink'}`

  return (
    <AuthShell
      heading={portal.heading}
      footer={
        portalKey === 'patient' ? (
          <>New patient? <Link to="/register" className="font-semibold text-clinic underline">Create an account</Link></>
        ) : portalKey === 'doctor' ? (
          <>Doctor accounts are created by the clinic administrator.</>
        ) : (
          <>Administrator accounts are created by the clinic.</>
        )
      }
    >
      <nav aria-label="Sign in as" className="mb-6 flex">
        <NavLink to="/login/patient" className={tab}>Patient</NavLink>
        <NavLink to="/login/doctor" className={tab}>Doctor</NavLink>
      </nav>

      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
        <Field label="Password" type="password" autoComplete="current-password" value={values.password} onChange={set('password')} error={errors.password} />
        {formError && <p role="alert" className="rounded bg-rose-soft px-3 py-2 text-sm text-rose">{formError}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : `Sign in as ${portal.word}`}</button>
      </form>

      {portalKey !== 'admin' && (
        <p className="mt-6 text-sm text-muted">
          Clinic staff? <Link to="/login/admin" className="underline">Administrator sign in</Link>
        </p>
      )}
    </AuthShell>
  )
}
