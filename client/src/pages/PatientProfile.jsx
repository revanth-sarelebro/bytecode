import { useState } from 'react'
import Layout from '../components/Layout'
import Field from '../components/Field'
import { useAuth } from '../context/AuthContext'
import { errorMessage, profileApi } from '../services/api'
import { BLOOD_GROUPS, profileSchema, validate } from '../lib/schemas'

export default function PatientProfile() {
  const { user, setUser } = useAuth()
  const [values, setValues] = useState({
    name: user.name ?? '',
    phone: user.phone ?? '',
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    bloodGroup: user.bloodGroup ?? '',
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    const { data, errors } = validate(profileSchema, values)
    setErrors(errors ?? {})
    if (!data) return

    setBusy(true)
    try {
      const updated = await profileApi.update(data)
      setUser((u) => ({ ...u, ...updated }))
      setMessage({ type: 'ok', text: 'Profile saved.' })
    } catch (err) {
      setMessage({ type: 'err', text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout title="Your profile" intro="Doctors see these details when you book a visit.">
      <form onSubmit={save} noValidate className="max-w-md space-y-4 rounded border border-line bg-white p-5">
        <div>
          <p className="label">Email</p>
          <p className="text-muted">{user.email}</p>
        </div>
        <Field label="Full name" value={values.name} onChange={set('name')} error={errors.name} />
        <Field label="Phone" type="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} error={errors.phone} />
        <Field label="Date of birth" type="date" value={values.dateOfBirth} onChange={set('dateOfBirth')} error={errors.dateOfBirth} />
        <Field as="select" label="Blood group" value={values.bloodGroup} onChange={set('bloodGroup')} error={errors.bloodGroup}>
          <option value="">Not set</option>
          {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </Field>
        {message.text && (
          <p role={message.type === 'err' ? 'alert' : 'status'} className={`rounded px-3 py-2 text-sm ${message.type === 'err' ? 'bg-rose-soft text-rose' : 'bg-clinic-soft text-clinic-dark'}`}>
            {message.text}
          </p>
        )}
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
      </form>
    </Layout>
  )
}
