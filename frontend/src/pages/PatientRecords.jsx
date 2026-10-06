import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { errorMessage, recordApi } from '../services/api'
import { formatDate } from '../lib/status'

export default function PatientRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    recordApi.mine().then(setRecords).catch((e) => setError(errorMessage(e))).finally(() => setLoading(false))
  }, [])

  return (
    <Layout title="Medical records" intro="Diagnoses and prescriptions added by your doctors.">
      {error && <p role="alert" className="mb-6 rounded bg-rose-soft px-3 py-2 text-rose">{error}</p>}
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : records.length === 0 ? (
        <p className="text-muted">No records yet. They appear here after a doctor completes a visit.</p>
      ) : (
        <ul className="space-y-4">
          {records.map((r) => (
            <li key={r.id} className="rounded border border-line bg-white p-5">
              <p className="text-sm text-muted">{formatDate(r.createdAt)} · {r.doctorName}</p>
              <p className="mt-2"><span className="font-semibold">Diagnosis: </span>{r.diagnosis}</p>
              {r.prescriptions && <p className="mt-1"><span className="font-semibold">Prescription: </span>{r.prescriptions}</p>}
            </li>
          ))}
        </ul>
      )}
    </Layout>
  )
}
