import { useEffect, useState } from 'react'
import Field from './Field'
import { errorMessage, medicationApi } from '../services/api'
import { medicationSchema, validate } from '../lib/schemas'

const EMPTY = { name: '', dosage: '', frequency: '', durationDays: '', notes: '' }

export default function MedicationPanel({ patientId }) {
  const [meds, setMeds] = useState([])
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => medicationApi.forPatient(patientId).then(setMeds).catch((e) => setError(errorMessage(e)))
  useEffect(() => { load() }, [patientId])

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const add = async (e) => {
    e.preventDefault()
    setError('')
    const { data, errors } = validate(medicationSchema, values)
    setErrors(errors ?? {})
    if (!data) return
    setBusy(true)
    try {
      await medicationApi.create({ patientId, ...data })
      setValues(EMPTY)
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {error && <p role="alert" className="mt-2 text-sm text-rose">{error}</p>}

      {meds.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No medications given yet.</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {meds.map((m) => (
            <li key={m.id} className="rounded bg-white/60 p-3">
              <p><span className="font-semibold">{m.name}</span> {m.dosage} · {m.frequency} · {m.durationDays} days</p>
              <p className="text-muted">{m.status === 'ACTIVE' ? 'Taking now' : 'Finished'}{m.notes ? ` · ${m.notes}` : ''}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} noValidate className="mt-4 space-y-3">
        <h4 className="font-display font-bold">Prescribe a medicine</h4>
        <Field label="Medicine" maxLength={80} value={values.name} onChange={set('name')} error={errors.name} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Dose" placeholder="500 mg" maxLength={60} value={values.dosage} onChange={set('dosage')} error={errors.dosage} />
          <Field label="Days" type="number" min={1} max={365} value={values.durationDays} onChange={set('durationDays')} error={errors.durationDays} />
        </div>
        <Field label="How often" placeholder="Twice daily after food" maxLength={80} value={values.frequency} onChange={set('frequency')} error={errors.frequency} />
        <Field as="textarea" rows={2} label="Notes for the patient" maxLength={300} value={values.notes} onChange={set('notes')} error={errors.notes} />
        <button className="btn-quiet" disabled={busy}>{busy ? 'Adding…' : 'Add medicine'}</button>
      </form>
    </div>
  )
}
