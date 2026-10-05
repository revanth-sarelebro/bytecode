import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/api'
import { loginSchema, validate } from '../lib/schemas'
import { HOME } from '../lib/status'
import AuthShell from './AuthShell'
import Field from '../components/Field'

export default function Login() {
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
      const u = await login(data)
      navigate(HOME[u.role], { replace: true })
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      heading="Sign in"
      footer={<>New patient? <Link to="/register" className="font-semibold text-clinic underline">Create an account</Link></>}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
        <Field label="Password" type="password" autoComplete="current-password" value={values.password} onChange={set('password')} error={errors.password} />
        {formError && <p role="alert" className="rounded bg-rose-soft px-3 py-2 text-sm text-rose">{formError}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </AuthShell>
  )
}
