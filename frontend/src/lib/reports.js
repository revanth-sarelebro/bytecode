export const REPORT_TYPES = {
  BLOOD_TEST: 'Blood test',
  XRAY: 'X-ray',
  SCAN: 'Scan',
  OTHER: 'Other report',
}

// Compare a result with its reference range. Returns 'LOW', 'HIGH', 'NORMAL' or null.
export function flagFor(r) {
  const v = parseFloat(r.value)
  if (Number.isNaN(v)) return null
  if (r.low != null && v < r.low) return 'LOW'
  if (r.high != null && v > r.high) return 'HIGH'
  return 'NORMAL'
}

// Doctor types one result per line: name, value, unit, low-high
// Example: Hemoglobin, 13.2, g/dL, 12-16
export function parseResults(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const results = []
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim())
    const range = parts[3]?.match(/^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$/)
    if (parts.length !== 4 || !parts[0] || Number.isNaN(parseFloat(parts[1])) || !range) {
      return { error: `Line ${i + 1} should look like: Hemoglobin, 13.2, g/dL, 12-16` }
    }
    results.push({ name: parts[0], value: parts[1], unit: parts[2], low: Number(range[1]), high: Number(range[2]) })
  }
  return { results }
}
