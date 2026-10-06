import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { adminExtraApi, errorMessage } from '../services/api'
import { actionText, isAlert } from '../lib/audit'
import { formatDate } from '../lib/status'

export default function AdminAudit() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [onlyAlerts, setOnlyAlerts] = useState(false)

  useEffect(() => {
    adminExtraApi.audit(200).then(setEntries).catch((e) => setError(errorMessage(e))).finally(() => setLoading(false))
  }, [])

  const shown = onlyAlerts ? entries.filter((e) => isAlert(e.action)) : entries

  return (
    <Layout title="Audit log" intro="Who signed in, viewed or changed what, and when. Entries cannot be edited.">
      {error && <p role="alert" className="mb-6 rounded bg-rose-soft px-3 py-2 text-rose">{error}</p>}

      <label className="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={onlyAlerts} onChange={(e) => setOnlyAlerts(e.target.checked)} />
        Show only failed sign ins and blocked requests
      </label>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="text-muted">No activity to show.</p>
      ) : (
        <div className="overflow-x-auto glass">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper">
              <tr>
                <th className="px-4 py-2 font-semibold">When</th>
                <th className="px-4 py-2 font-semibold">Who</th>
                <th className="px-4 py-2 font-semibold">What happened</th>
                <th className="px-4 py-2 font-semibold">Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(e.createdAt)}</td>
                  <td className="px-4 py-3">{e.actorName} <span className="text-muted">({e.actorRole?.toLowerCase()})</span></td>
                  <td className="px-4 py-3">
                    <span className={isAlert(e.action) ? 'rounded bg-rose-soft px-2 py-0.5 font-semibold text-rose' : ''}>
                      {actionText(e.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{e.target || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
