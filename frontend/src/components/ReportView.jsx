import { REPORT_TYPES, flagFor } from '../lib/reports'

const FLAG_TEXT = { LOW: 'Low', HIGH: 'High', NORMAL: 'Normal' }

export default function ReportView({ report }) {
  const { results = [], findings, impression } = report
  return (
    <div className="mt-4 space-y-4 text-sm">
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-line">
              <tr>
                <th className="py-2 pr-3 font-semibold">Test</th>
                <th className="py-2 pr-3 font-semibold">Result</th>
                <th className="py-2 pr-3 font-semibold">Reference range</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {results.map((r) => {
                const flag = flagFor(r)
                const off = flag === 'LOW' || flag === 'HIGH'
                return (
                  <tr key={r.name}>
                    <td className="py-2 pr-3">{r.name}</td>
                    <td className={`py-2 pr-3 ${off ? 'font-semibold text-rose' : ''}`}>{r.value} <span className="text-muted">{r.unit}</span></td>
                    <td className="py-2 pr-3 text-muted">{r.low} to {r.high} {r.unit}</td>
                    <td className={`py-2 ${off ? 'font-semibold text-rose' : 'text-muted'}`}>{flag ? FLAG_TEXT[flag] : '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {findings && (
        <div>
          <h4 className="font-display font-bold">Findings</h4>
          <p className="mt-1 whitespace-pre-line">{findings}</p>
        </div>
      )}

      {impression && (
        <div>
          <h4 className="font-display font-bold">Impression</h4>
          <p className="mt-1 whitespace-pre-line">{impression}</p>
        </div>
      )}

      <p className="text-xs text-muted">{REPORT_TYPES[report.type] ?? 'Report'} · reported by {report.doctorName}</p>
    </div>
  )
}
