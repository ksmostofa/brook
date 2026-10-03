export type Parameter = 'temperature' | 'ph' | 'oxygen' | 'turbidity' | 'conductivity'
export type Reading = { id: string; site: string; parameter: string; value: number | null; unit: string; measuredAt: string; observer: string; latitude?: number; longitude?: number; note?: string }
export type RecordEntry = { reading: Reading; original: Record<string, unknown>; source: string; synthetic: boolean; history: { at: string; action: string; detail: string }[]; review: 'pending' | 'accepted' | 'recheck' | 'excluded'; revisions: Reading[] }
export type Finding = { code: string; title: string; detail: string; next: string }
export const parameters: Record<Parameter, { label: string; unit: string; min: number; max: number; code: string }> = {
  temperature: { label: 'Water temperature', unit: 'Cel', min: -5, max: 60, code: 'temperature' },
  ph: { label: 'pH', unit: '[pH]', min: 0, max: 14, code: 'ph' },
  oxygen: { label: 'Dissolved oxygen', unit: 'mg/L', min: 0, max: 30, code: 'oxygen' },
  turbidity: { label: 'Turbidity', unit: 'NTU', min: 0, max: 10000, code: 'turbidity' },
  conductivity: { label: 'Conductivity', unit: 'uS/cm', min: 0, max: 100000, code: 'conductivity' },
}
export const parameterLabel = (key: string) => parameters[key as Parameter]?.label ?? key
export const currentReading = (entry: RecordEntry) => entry.revisions.at(-1) ?? entry.reading
const numeric = (value: unknown) => value === undefined || value === null || typeof value === 'string' && !value.trim() ? null : typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN
export function normalize(raw: Record<string, unknown>, index: number): Reading {
  const numberOrUndefined = (value: unknown) => numeric(value) ?? undefined
  return { id: String(raw.id || `import-${index + 1}`), site: String(raw.site ?? ''), parameter: String(raw.parameter ?? '').toLowerCase(), value: numeric(raw.value), unit: String(raw.unit ?? ''), measuredAt: String(raw.measuredAt ?? raw.timestamp ?? ''), observer: String(raw.observer ?? ''), latitude: numberOrUndefined(raw.latitude), longitude: numberOrUndefined(raw.longitude), note: String(raw.note ?? '') }
}
function fingerprint(reading: Reading) {
  return JSON.stringify([reading.site.trim().toLowerCase(), reading.parameter, Number.isNaN(Date.parse(reading.measuredAt)) ? reading.measuredAt : new Date(reading.measuredAt).toISOString(), reading.value, reading.unit])
}
function validCollectionTime(value: string): boolean {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-](\d{2}):(\d{2}))$/.exec(value)
  if (!parts || !Number.isFinite(Date.parse(value))) return false
  const [year, month, day, hour, minute, second] = parts.slice(1, 7).map(x => Number(x ?? 0))
  if (year < 1 || month < 1 || month > 12 || day < 1 || hour > 23 || minute > 59 || second > 59) return false
  // Years 1–99 need a 400-year calendar shift because Date.UTC treats them as 1901–1999.
  const daysInMonth = new Date(Date.UTC(year < 100 ? year + 400 : year, month, 0)).getUTCDate()
  if (day > daysInMonth) return false
  const offsetHours = Number(parts[8] ?? 0), offsetMinutes = Number(parts[9] ?? 0)
  return offsetHours <= 14 && offsetMinutes <= 59 && (offsetHours !== 14 || offsetMinutes === 0)
}
export function validate(entry: RecordEntry, entries: RecordEntry[], now = Date.now(), duplicateIndex?: Map<string, RecordEntry[]>): Finding[] {
  const r = currentReading(entry), config = Object.hasOwn(parameters, r.parameter) ? parameters[r.parameter as Parameter] : undefined, flags: Finding[] = []
  const add = (code: string, title: string, detail: string, next: string) => flags.push({ code, title, detail, next })
  if (!r.site.trim() || !r.observer.trim()) add('identity', 'Missing collection context', 'A site name and observer are required for traceable observations.', 'Record the site and who collected this measurement.')
  if (!config) add('parameter', 'Unknown parameter', `“${r.parameter || 'Empty'}” has no configured validation rule.`, 'Use temperature, ph, oxygen, turbidity, or conductivity.')
  if (r.value === null || !Number.isFinite(r.value)) add('value', 'Missing or invalid measurement', 'The measurement must be a finite number. Missing values are never treated as zero.', 'Enter the number shown on the instrument.')
  else if (config && (r.value < config.min || r.value > config.max)) add('range', 'Outside the review range', `${r.value} falls outside the configured ${config.min}–${config.max} ${config.unit} plausibility range. This is a data-quality check, not a water-health threshold.`, 'Check the instrument, unit and decimal point. Take another reading.')
  if (config && r.unit !== config.unit) add('unit', 'Unit needs confirmation', `Expected ${config.unit}; received “${r.unit || 'empty'}”. Brook does not silently convert units.`, `Check the instrument display and record the measurement in ${config.unit}.`)
  const time = Date.parse(r.measuredAt)
  if (!validCollectionTime(r.measuredAt)) add('time', 'Missing or invalid collection time', 'Collection time must be a real calendar date and ISO time with an explicit time zone.', 'Record when this reading was taken, including the time zone. Check the day and month.')
  else if (time > now + 5 * 60 * 1000) add('future', 'Collection time is in the future', 'This timestamp is more than five minutes ahead of the review clock.', 'Check the clock and time zone. Preserve the original timestamp in the audit history.')
  if ((r.latitude !== undefined && (!Number.isFinite(r.latitude) || Math.abs(r.latitude) > 90)) || (r.longitude !== undefined && (!Number.isFinite(r.longitude) || Math.abs(r.longitude) > 180))) add('coordinates', 'Invalid coordinates', 'Latitude must be between −90 and 90; longitude between −180 and 180.', 'Check GPS coordinates against the collection site.')
  const matching = duplicateIndex?.get(fingerprint(r))
  const duplicate = duplicateIndex ? matching?.[0] === entry ? matching[1] : matching?.[0] : entries.find(other => other !== entry && other.review !== 'excluded' && fingerprint(currentReading(other)) === fingerprint(r))
  if (duplicate) add('duplicate', 'Possible duplicate', `Same site, parameter, time, value and unit as ${duplicate.reading.id}. IDs alone do not prove distinct measurements.`, 'Confirm whether this was a second sample. Enter a fresh reading or exclude the duplicate.')
  return flags
}
export function validateAll(entries: RecordEntry[], now = Date.now()): Finding[][] {
  const index = new Map<string, RecordEntry[]>()
  for (const entry of entries) {
    if (entry.review === 'excluded') continue
    const key = fingerprint(currentReading(entry)), group = index.get(key)
    if (group) group.push(entry)
    else index.set(key, [entry])
  }
  return entries.map(entry => validate(entry, entries, now, index))
}
export function createEntry(raw: Record<string, unknown>, index: number, source: string, synthetic = false): RecordEntry {
  return { reading: normalize(raw, index), original: { ...raw }, source, synthetic, history: [{ at: new Date().toISOString(), action: 'Imported', detail: source }], review: 'pending', revisions: [] }
}
export function recheck(entry: RecordEntry, reading: Reading, explanation: string, at = new Date().toISOString()): RecordEntry {
  if (!explanation.trim()) throw new Error('Explain the recheck so the next reviewer can follow the change.')
  return { ...entry, revisions: [...entry.revisions, { ...reading, id: entry.reading.id }], review: 'pending', history: [...entry.history, { at, action: 'Recheck recorded', detail: explanation.trim() }] }
}
export function review(entry: RecordEntry, entries: RecordEntry[], decision: 'accepted' | 'recheck' | 'excluded', note: string, now = Date.now()): RecordEntry {
  if (!note.trim()) throw new Error('A reviewer note is required.')
  if (entry.review === 'excluded' && decision === 'accepted') throw new Error('Record a recheck to reopen an excluded observation before accepting it.')
  if (decision === 'accepted' && validate(entry, entries, now).length) throw new Error('Resolve all data-quality findings before accepting this observation.')
  return { ...entry, review: decision, history: [...entry.history, { at: new Date(now).toISOString(), action: decision === 'accepted' ? 'Reviewer accepted' : decision === 'excluded' ? 'Reviewer excluded' : 'Recheck requested', detail: note.trim() }] }
}
export function parseCSV(input: string): Record<string, unknown>[] {
  const rows: string[][] = []; let row: string[] = [], cell = '', quote = false
  const s = input.replace(/^\uFEFF/, '')
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '"') { if (quote && s[i + 1] === '"') { cell += '"'; i++ } else quote = !quote }
    else if (ch === ',' && !quote) { row.push(cell); cell = '' }
    else if ((ch === '\n' || ch === '\r') && !quote) { if (ch === '\r' && s[i + 1] === '\n') i++; row.push(cell); if (row.some(c => c.trim())) rows.push(row); row = []; cell = '' }
    else cell += ch
  }
  if (quote) throw new Error('CSV has an unclosed quoted field.')
  row.push(cell); if (row.some(c => c.trim())) rows.push(row)
  const headers = rows.shift()?.map(h => h.trim()) ?? []
  if (!headers.includes('parameter') || !headers.includes('value')) throw new Error('CSV requires parameter and value columns. Use the sample template.')
  if (new Set(headers).size !== headers.length) throw new Error('CSV has duplicate column names.')
  return rows.map((cells, i) => { if (cells.length !== headers.length) throw new Error(`CSV row ${i + 2} has ${cells.length} fields; expected ${headers.length}.`); return Object.fromEntries(headers.map((header, j) => [header, cells[j]])) })
}
export function importObservations(text: string, filename: string): RecordEntry[] {
  let data: unknown
  if (filename.toLowerCase().endsWith('.csv')) data = parseCSV(text)
  else { const parsed: unknown = JSON.parse(text); data = Array.isArray(parsed) ? parsed : typeof parsed === 'object' && parsed !== null && 'observations' in parsed ? parsed.observations : parsed }
  if (!Array.isArray(data) || !data.length) throw new Error('Provide a non-empty JSON array or CSV of observations.')
  if (data.length > 2000) throw new Error('Import up to 2,000 observations at a time.')
  return data.map((raw, i) => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error(`Observation ${i + 1} must be an object.`)
    const synthetic = raw.synthetic === true || typeof raw.synthetic === 'string' && raw.synthetic.trim().toLowerCase() === 'true'
    return createEntry(raw, i, filename, synthetic)
  })
}
export function exportFHIR(entries: RecordEntry[], now = Date.now()) {
  const checks = validateAll(entries, now)
  const eligible = entries.filter((e, i) => e.review === 'accepted' && !checks[i].length)
  const sites = [...new Set(eligible.map(e => currentReading(e).site))]
  const locationIds = new Map(sites.map((site, i) => [site, `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`]))
  return { resourceType: 'Bundle', type: 'collection', timestamp: new Date(now).toISOString(), entry: [
    ...sites.map(site => ({ fullUrl: `urn:uuid:${locationIds.get(site)}`, resource: { resourceType: 'Location', id: locationIds.get(site), name: site, status: 'active' } })),
    ...eligible.map((e, i) => { const r = currentReading(e), config = parameters[r.parameter as Parameter], id = `10000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`; return { fullUrl: `urn:uuid:${id}`, resource: { resourceType: 'Observation', id, status: 'final', identifier: [{ system: 'urn:brook:observation', value: e.reading.id }], code: { coding: [{ system: 'urn:brook:parameters', code: r.parameter, display: config.label }] }, subject: { reference: `urn:uuid:${locationIds.get(r.site)}` }, effectiveDateTime: new Date(r.measuredAt).toISOString(), valueQuantity: { value: r.value, unit: config.unit, ...(r.parameter === 'turbidity' ? {} : { system: 'http://unitsofmeasure.org', code: config.unit }) }, note: [{ text: `${e.synthetic ? 'SYNTHETIC DEMO. ' : ''}Source: ${e.source}. Observer: ${r.observer}. Accepted by local reviewer. Data-quality acceptance does not establish water safety.` }, ...e.history.map(h => ({ text: `${h.at} | ${h.action} | ${h.detail}` }))] } } }),
  ] }
}
export function demoEntries(now = Date.now()): RecordEntry[] {
  const ago = new Date(now - 3600000).toISOString()
  const base = { site: 'Willow reach', measuredAt: ago, observer: 'Demo field crew', latitude: 35.92, longitude: 139.48 }
  const raws = [
    { ...base, id: 'BRK-001', parameter: 'temperature', value: 19.8, unit: 'Cel', note: 'Shaded bank. Synthetic fixture.' },
    { ...base, id: 'BRK-002', parameter: 'ph', value: 74, unit: '[pH]', note: 'Possible decimal transcription error. Synthetic fixture.' },
    { ...base, id: 'BRK-003', parameter: 'oxygen', value: 8.1, unit: 'ppm', note: 'Unit differs from instrument template. Synthetic fixture.' },
    { ...base, id: 'BRK-004', parameter: 'turbidity', value: 12, unit: 'NTU' },
    { ...base, id: 'BRK-005', parameter: 'turbidity', value: 12, unit: 'NTU' },
    { ...base, id: 'BRK-006', parameter: 'conductivity', value: 240, unit: 'uS/cm', measuredAt: new Date(now + 86400000).toISOString() },
    { ...base, id: 'BRK-007', site: 'Meadow bridge', parameter: 'oxygen', value: null, unit: 'mg/L', observer: '' },
  ]
  return raws.map((r, i) => createEntry(r, i, 'Synthetic walkthrough', true))
}
