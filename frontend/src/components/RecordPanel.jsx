import { useEffect, useState } from 'react'
import Field from './Field'
import { errorMessage, recordApi } from '../services/api'
import { recordSchema, validate } from '../lib/schemas'
import { formatDate } from '../lib/status'

export default function RecordPanel({ patientId }) {
  const [records, setRecords] = useState([])
  const [values, setValues] = useState({ diagnosis: '', prescriptions: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => recordApi.forPatient(patientId).then(setRecords).catch((e) => setError(errorMessage(e)))
  useEffect(() => { load() }, [patientId])

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const add = async (e) => {
    e.preventDefault()
    setError('')
    const { data, errors } = validate(recordSchema, values)
    setErrors(errors ?? {})
    if (!data) return
    setBusy(true)
    try {
      await recordApi.create({ patientId, ...data })
      setValues({ diagnosis: '', prescriptions: '' })
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <h3 className="text-lg font-bold">Medical records</h3>
      {error && <p role="alert" className="mt-2 text-sm text-rose">{error}</p>}

      {records.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No records for this patient yet.</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {records.map((r) => (
            <li key={r.id} className="rounded bg-paper p-3">
              <p className="text-muted">{formatDate(r.createdAt)} · {r.doctorName}</p>
              <p><span className="font-semibold">Diagnosis: </span>{r.diagnosis}</p>
              {r.prescriptions && <p><span className="font-semibold">Prescription: </span>{r.prescriptions}</p>}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} noValidate className="mt-4 space-y-3">
        <Field label="Diagnosis" value={values.diagnosis} maxLength={500} onChange={set('diagnosis')} error={errors.diagnosis} />
        <Field as="textarea" rows={2} label="Prescription" value={values.prescriptions} maxLength={500} onChange={set('prescriptions')} error={errors.prescriptions} />
        <button className="btn-quiet" disabled={busy}>{busy ? 'Adding…' : 'Add record'}</button>
      </form>
    </div>
  )
}
