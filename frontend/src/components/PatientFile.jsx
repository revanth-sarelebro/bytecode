import { useState } from 'react'
import RecordPanel from './RecordPanel'
import ReportPanel from './ReportPanel'
import MedicationPanel from './MedicationPanel'

const TABS = [
  { key: 'records', label: 'Records' },
  { key: 'reports', label: 'Reports' },
  { key: 'meds', label: 'Medications' },
]

export default function PatientFile({ patientId }) {
  const [tab, setTab] = useState('records')

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div role="tablist" aria-label="Patient file" className="flex gap-5 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 pb-2 text-sm font-semibold ${tab === t.key ? 'border-clinic text-clinic' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="pt-2">
        {tab === 'records' && <RecordPanel patientId={patientId} />}
        {tab === 'reports' && <ReportPanel patientId={patientId} />}
        {tab === 'meds' && <MedicationPanel patientId={patientId} />}
      </div>
    </div>
  )
}
