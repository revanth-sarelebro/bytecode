import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/api'
import { registerSchema, validate } from '../lib/schemas'
import { HOME } from '../lib/status'
import AuthShell from './AuthShell'
import Field from '../components/Field'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setFormError('')
    const { data, errors } = validate(registerSchema, values)
    setErrors(errors ?? {})
    if (!data) return

    setBusy(true)
    try {
      // Role is never sent. The server always creates self-signups as PATIENT.
      const u = await register(data)
      navigate(HOME[u.role], { replace: true })
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      heading="Create your account"
      footer={<>Already registered? <Link to="/login" className="font-semibold text-clinic underline">Sign in</Link></>}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Full name" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} />
        <Field label="Email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
        <Field label="Password" type="password" autoComplete="new-password" value={values.password} onChange={set('password')} error={errors.password} />
        <p className="-mt-2 text-sm text-muted">At least 8 characters, with a letter and a number.</p>
        {formError && <p role="alert" className="rounded bg-rose-soft px-3 py-2 text-sm text-rose">{formError}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthShell>
  )
}
