import { useEffect, useState } from 'react'
import Field from './Field'
import ReportView from './ReportView'
import { errorMessage, reportApi } from '../services/api'
import { REPORT_TYPES, parseResults } from '../lib/reports'
import { REPORT_TYPE_KEYS, reportSchema, validate } from '../lib/schemas'
import { formatDate } from '../lib/status'

const EMPTY = { type: 'BLOOD_TEST', title: '', resultsText: '', findings: '', impression: '' }

export default function ReportPanel({ patientId }) {
  const [reports, setReports] = useState([])
  const [openId, setOpenId] = useState(null)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => reportApi.forPatient(patientId).then(setReports).catch((e) => setError(errorMessage(e)))
  useEffect(() => { load() }, [patientId])

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const add = async (e) => {
    e.preventDefault()
    setError('')
    const { data, errors } = validate(reportSchema, values)
    const next = { ...(errors ?? {}) }
    let results = []
    if (data && data.type === 'BLOOD_TEST') {
      const parsed = parseResults(data.resultsText)
      if (parsed.error) next.resultsText = parsed.error
      else results = parsed.results
      if (!parsed.error && results.length === 0) next.resultsText = 'Add at least one result line'
    }
    setErrors(next)
    if (!data || Object.keys(next).length) return

    setBusy(true)
    try {
      await reportApi.create({ patientId, type: data.type, title: data.title, results, findings: data.findings, impression: data.impression })
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

      {reports.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No reports for this patient yet.</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {reports.map((r) => (
            <li key={r.id} className="rounded bg-white/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span><span className="font-semibold">{r.title}</span> <span className="text-muted">· {REPORT_TYPES[r.type]} · {formatDate(r.createdAt)}</span></span>
                <button className="btn-quiet" onClick={() => setOpenId(openId === r.id ? null : r.id)} aria-expanded={openId === r.id}>
                  {openId === r.id ? 'Hide' : 'View'}
                </button>
              </div>
              {openId === r.id && <ReportView report={r} />}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} noValidate className="mt-4 space-y-3">
        <h4 className="font-display font-bold">Add a report</h4>
        <Field as="select" label="Type" value={values.type} onChange={set('type')} error={errors.type}>
          {REPORT_TYPE_KEYS.map((k) => <option key={k} value={k}>{REPORT_TYPES[k]}</option>)}
        </Field>
        <Field label="Title" maxLength={100} value={values.title} onChange={set('title')} error={errors.title} />
        {values.type === 'BLOOD_TEST' && (
          <div>
            <Field
              as="textarea" rows={5} label="Results, one per line" value={values.resultsText} onChange={set('resultsText')}
              error={errors.resultsText} placeholder={'Hemoglobin, 13.2, g/dL, 12-16\nPlatelets, 250, 10^3/uL, 150-400'}
            />
            <p className="mt-1 text-xs text-muted">Format: name, value, unit, low-high</p>
          </div>
        )}
        <Field as="textarea" rows={3} label="Findings" maxLength={1500} value={values.findings} onChange={set('findings')} error={errors.findings} />
        <Field as="textarea" rows={2} label="Impression" maxLength={500} value={values.impression} onChange={set('impression')} error={errors.impression} />
        <button className="btn-quiet" disabled={busy}>{busy ? 'Adding…' : 'Add report'}</button>
      </form>
    </div>
  )
}
