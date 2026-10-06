import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { errorMessage, medicationApi } from '../services/api'
import { formatDate } from '../lib/status'

function endDate(m) {
  return new Date(new Date(m.startDate).getTime() + m.durationDays * 86400000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function MedList({ items, muted }) {
  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li key={m.id} className={`glass p-4 ${muted ? 'opacity-80' : ''}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-lg font-semibold">{m.name} <span className="font-normal text-muted">{m.dosage}</span></p>
            <p className="text-sm text-muted">{m.status === 'ACTIVE' ? `Until ${endDate(m)}` : `Finished ${endDate(m)}`}</p>
          </div>
          <p className="mt-1">{m.frequency} for {m.durationDays} day{m.durationDays > 1 ? 's' : ''}</p>
          {m.notes && <p className="mt-1 text-sm">{m.notes}</p>}
          <p className="mt-2 text-xs text-muted">Prescribed by {m.doctorName} on {formatDate(m.startDate)}</p>
        </li>
      ))}
    </ul>
  )
}

export default function PatientMedications() {
  const [meds, setMeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    medicationApi.mine().then(setMeds).catch((e) => setError(errorMessage(e))).finally(() => setLoading(false))
  }, [])

  const current = meds.filter((m) => m.status === 'ACTIVE')
  const past = meds.filter((m) => m.status !== 'ACTIVE')

  return (
    <Layout title="Medications" intro="Medicines your doctors have given you. Follow the dose on the label and ask your doctor if unsure.">
      {error && <p role="alert" className="mb-6 rounded bg-rose-soft px-3 py-2 text-rose">{error}</p>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : meds.length === 0 ? (
        <p className="text-muted">No medications yet.</p>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-xl font-bold">Taking now</h2>
            {current.length ? <MedList items={current} /> : <p className="text-muted">Nothing active right now.</p>}
          </section>
          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Finished</h2>
              <MedList items={past} muted />
            </section>
          )}
        </div>
      )}
    </Layout>
  )
}
