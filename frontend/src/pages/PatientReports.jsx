import { useEffect, useState } from 'react'
import { Printer } from 'lucide-react'
import Layout from '../components/Layout'
import ReportView from '../components/ReportView'
import { errorMessage, reportApi } from '../services/api'
import { REPORT_TYPES } from '../lib/reports'
import { formatDate } from '../lib/status'

export default function PatientReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    reportApi.mine().then(setReports).catch((e) => setError(errorMessage(e))).finally(() => setLoading(false))
  }, [])

  return (
    <Layout title="Reports" intro="Your full blood test, X-ray and scan reports, exactly as your doctor entered them.">
      {error && <p role="alert" className="mb-6 rounded bg-rose-soft px-3 py-2 text-rose">{error}</p>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : reports.length === 0 ? (
        <p className="text-muted">No reports yet. They appear here when your doctor adds one.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => {
            const open = openId === r.id
            return (
              <li key={r.id} className="glass p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{r.title}</p>
                    <p className="text-sm text-muted">{REPORT_TYPES[r.type] ?? 'Report'} · {formatDate(r.createdAt)} · {r.doctorName}</p>
                  </div>
                  <div className="no-print flex gap-2">
                    <button onClick={() => setOpenId(open ? null : r.id)} className="btn-quiet" aria-expanded={open}>
                      {open ? 'Hide report' : 'View full report'}
                    </button>
                    {open && (
                      <button onClick={() => window.print()} className="btn-quiet gap-1.5">
                        <Printer size={14} aria-hidden="true" /> Print or save as PDF
                      </button>
                    )}
                  </div>
                </div>
                {open && <ReportView report={r} />}
              </li>
            )
          })}
        </ul>
      )}
    </Layout>
  )
}
