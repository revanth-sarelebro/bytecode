import { useState } from 'react'
import { Link, NavLink, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi, errorMessage } from '../services/api'
import { loginSchema, validate } from '../lib/schemas'
import { HOME } from '../lib/status'
import AuthShell, { TONES } from './AuthShell'
import Field from '../components/Field'
import OtpForm from '../components/OtpForm'

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
  const tone = TONES[portalKey]

  const { user, login, verifyOtp } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [challenge, setChallenge] = useState(null)

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
      const res = await login(data, portal.role)
      if (res.otpRequired) {
        setChallenge({ ...res, email: data.email })
      } else {
        navigate(HOME[res.role], { replace: true })
      }
    } catch (err) {
      if (err.actualRole) {
        setFormError(wrongPortal(err.actualRole))
      } else {
        setFormError(errorMessage(err))
      }
    } finally {
      setBusy(false)
    }
  }

  const wrongPortal = (role) => `This is a ${ROLE_WORD[role]} account. Use the ${ROLE_WORD[role]} sign in page.`

  const verify = async (code) => {
    try {
      const u = await verifyOtp({ challengeId: challenge.challengeId, code }, portal.role)
      navigate(HOME[u.role], { replace: true })
    } catch (err) {
      if (err.actualRole) {
        setChallenge(null)
        setFormError(wrongPortal(err.actualRole))
        return
      }
      throw err
    }
  }

  const resend = async () => {
    const next = await authApi.resendOtp({ challengeId: challenge.challengeId })
    setChallenge((c) => ({ ...c, ...next }))
  }

  const tab = ({ isActive }) =>
    `flex-1 border-b-2 px-3 py-2 text-center font-semibold ${isActive ? `${tone.border} ${tone.text}` : 'border-line text-muted hover:text-ink'}`

  return (
    <AuthShell
      tone={portalKey}
      heading={challenge ? 'Check your code' : portal.heading}
      footer={
        portalKey === 'patient' ? (
          <>New patient? <Link to="/register" className={`font-semibold underline ${tone.text}`}>Create an account</Link></>
        ) : portalKey === 'doctor' ? (
          <>Doctor accounts are created by the clinic administrator.</>
        ) : (
          <>Administrator accounts are created by the clinic.</>
        )
      }
    >
      {challenge ? (
        <OtpForm
          email={challenge.email} challenge={challenge} buttonClass={tone.btn}
          onVerify={verify} onResend={resend} onBack={() => setChallenge(null)}
        />
      ) : (
        <>
        <nav aria-label="Sign in as" className="mb-6 flex">
          <NavLink to="/login/patient" className={tab}>Patient</NavLink>
          <NavLink to="/login/doctor" className={tab}>Doctor</NavLink>
        </nav>

        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
          <Field label="Password" type="password" autoComplete="current-password" value={values.password} onChange={set('password')} error={errors.password} />
          {formError && <p role="alert" className="rounded bg-rose-soft px-3 py-2 text-sm text-rose">{formError}</p>}
          <button className={`btn w-full ${tone.btn}`} disabled={busy}>{busy ? 'Signing in…' : `Sign in as ${portal.word}`}</button>
        </form>
        </>
      )}

      {portalKey !== 'admin' && !challenge && (
        <p className="mt-6 text-sm text-muted">
          Clinic staff? <Link to="/login/admin" className="underline">Administrator sign in</Link>
        </p>
      )}
    </AuthShell>
  )
}
