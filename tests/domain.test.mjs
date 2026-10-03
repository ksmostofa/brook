import test from 'node:test'
import assert from 'node:assert/strict'
import { createEntry, demoEntries, validate, validateAll, currentReading, recheck, review, importObservations, exportFHIR } from './.compiled/observations.js'

const now = Date.parse('2026-10-03T01:00:00Z')
const valid = (overrides = {}) => createEntry({ id: 'A', site: 'Brook', observer: 'Observer', parameter: 'ph', value: 7.4, unit: '[pH]', measuredAt: '2026-10-03T00:00:00Z', ...overrides }, 0, 'fixture', true)
test('missing values never become zero', () => {
  for (const value of ['', '   ', null, undefined, 'NaN', true, []]) { const e = valid({ value }); assert.ok(validate(e, [e], now).some(f => f.code === 'value')) }
})
test('unit mismatch and impossible pH require a recheck', () => {
  const e = valid({ value: 74, unit: 'mg/L' })
  assert.deepEqual(validate(e, [e], now).map(f => f.code), ['range', 'unit'])
})
test('future dates and invalid coordinates are independent findings', () => {
  const e = valid({ measuredAt: '2026-10-04T00:00:00Z', latitude: 100 })
  assert.deepEqual(validate(e, [e], now).map(f => f.code), ['future', 'coordinates'])
})
test('duplicate detection ignores IDs, whitespace and equivalent time zones', () => {
  const a = valid(), b = valid({ id: 'B', site: ' BROOK ', measuredAt: '2026-10-03T09:00:00+09:00' })
  assert.ok(validate(a, [a, b], now).some(f => f.code === 'duplicate'))
  assert.ok(validate(b, [a, b], now).some(f => f.code === 'duplicate'))
})
test('recheck preserves original and requires an explanation', () => {
  const e = valid({ value: 74 }); const raw = structuredClone(e.original)
  assert.throws(() => recheck(e, { ...e.reading, value: 7.4 }, ''), /Explain/)
  const updated = recheck(e, { ...e.reading, value: 7.4 }, 'Repeated measurement', '2026-10-03T01:00:00Z')
  assert.deepEqual(updated.original, raw); assert.equal(e.reading.value, 74)
  assert.equal(currentReading(updated).value, 7.4); assert.equal(updated.review, 'pending')
})
test('review cannot bypass findings and always requires a note', () => {
  const e = valid({ value: 74 })
  assert.throws(() => review(e, [e], 'accepted', 'OK', now), /Resolve/)
  assert.throws(() => review(valid(), [valid()], 'accepted', '', now), /required/)
})
test('CSV handles quotes, comma-containing notes, CRLF and blank rows', () => {
  const csv = 'id,site,parameter,value,unit,measuredAt,observer,note\r\nA,Brook,ph,7.4,[pH],2026-10-03T00:00:00Z,Ada,"clear, no foam"\r\n\r\n'
  const imported = importObservations(csv, 'field.csv')
  assert.equal(imported[0].original.note, 'clear, no foam'); assert.equal(imported[0].synthetic, false)
  assert.equal(validate(imported[0], imported, now).length, 0)
})
test('malformed CSV and JSON shapes fail before partial import', () => {
  assert.throws(() => importObservations('[null]', 'field.json'), /object/)
  assert.throws(() => importObservations('parameter,value\nph,7.4,extra', 'field.csv'), /fields/)
  assert.throws(() => importObservations('parameter,value\nph,"7.4', 'field.csv'), /unclosed/)
  assert.throws(() => importObservations('[]', 'field.json'), /non-empty/)
})
test('FHIR exports accepted current readings only, with resolved location references', () => {
  const pending = valid({ id: 'pending', site: 'Other' })
  const e = valid(), accepted = review(e, [e], 'accepted', 'Unit and time checked', now)
  const bundle = exportFHIR([accepted, pending], now)
  assert.equal(bundle.entry.length, 2)
  const observation = bundle.entry[1].resource
  assert.equal(observation.valueQuantity.value, 7.4)
  assert.equal(observation.subject.reference, bundle.entry[0].fullUrl)
  assert.match(observation.note[0].text, /SYNTHETIC/)
})
test('stale accepted status never bypasses export validation', () => {
  const invalid = { ...valid({ value: 74 }), review: 'accepted' }
  assert.equal(exportFHIR([invalid], now).entry.length, 0)
})
test('synthetic walkthrough covers five independent defect types', () => {
  const entries = demoEntries(now), codes = new Set(entries.flatMap(e => validate(e, entries, now).map(f => f.code)))
  for (const code of ['range', 'unit', 'duplicate', 'future', 'value', 'identity']) assert.ok(codes.has(code))
})
test('bulk validation preserves individual findings and notices collisions', () => {
  const entries = Array.from({ length: 2000 }, (_, i) => valid({ id: `B-${i}`, site: `Site ${i}` }))
  entries[1999] = valid({ id: 'collision', site: 'Site 0' })
  const checks = validateAll(entries, now)
  assert.equal(checks.filter(f => f.length).length, 2)
  assert.deepEqual(checks[0], validate(entries[0], entries, now))
  assert.deepEqual(checks[1999], validate(entries[1999], entries, now))
})
