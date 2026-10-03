# Brook

[Open the working demo](https://ksmostofa.github.io/brook/). [Public source repository](https://github.com/ksmostofa/brook).

A field-observation quality workbench for citizen science. Brook catches collection errors, explains the next recheck, preserves the original record and lets a reviewer accept data before export.

Primary target: **OneAquaHealth IEEE Global Hackathon, Track 3: AI-Supported Assessment**. Secondary fit: Track 1 Citizen Science UX and Track 7 Digital Health Standards.

## Run

```sh
npm install
npm run dev
npm run build
node tests/run.mjs
```

The UI uses the requested shadcn Luma preset `b1VlJBjs` and selected RareUI components. No other UI component kit is required. See `components.json` for the installed preset and registries.

## Try the complete workflow

1. Open the default synthetic field session. Select `BRK-002`, which has pH `74`.
2. Read the range finding. Acceptance is disabled while findings remain.
3. Choose **Record a recheck**, enter pH `7.4`, and explain the repeated measurement or transcription correction. Save.
4. Write a review note and accept the observation. Inspect the audit trail and original record. The original value is still `74`.
5. Export accepted observations. The FHIR JSON includes the corrected reading and review notes, and excludes flagged and pending readings.
6. Select `BRK-005`, add a note confirming the duplicated import, and choose **Exclude observation**. `BRK-004` can now be reviewed without editing either timestamp. Excluded data remains in the archive.
7. Import your own CSV or JSON, or download the synthetic example from the import panel. Every imported reading starts pending. Reload to confirm browser persistence.

The default fixture is conspicuously synthetic. Its coordinates and measurements do not describe an actual stream. Imported file names are retained as provenance labels, not verified evidence of authenticity.

## Import format

A JSON array, a JSON object containing an `observations` array, or a CSV with headers:

```csv
id,site,parameter,value,unit,measuredAt,observer,latitude,longitude,note
FIELD-001,Example stream,ph,7.4,[pH],2026-10-03T00:00:00Z,Field observer,35.92,139.48,Instrument reading
```

`parameter` supports `temperature`, `ph`, `oxygen`, `turbidity`, and `conductivity`. Expected units are `Cel`, `[pH]`, `mg/L`, `NTU`, and `uS/cm`, respectively. Collection times require a real calendar date and ISO date-time with an explicit time zone. Impossible dates do not silently roll into another month. CSV supports quoted commas and multiline fields. An optional `synthetic` field set to `true` marks demo data throughout review and export. Imports append to the session. Limit: 2 MB file, 2,000 records per import.

Missing values remain missing. Brook never silently converts units. Imported unknown parameters or implausible values remain in the queue for review.

## Checks and acceptance

All checks are pure functions in `src/lib/observations.ts`:

- Required site and observer context.
- Supported parameter and finite measurement.
- Explicit unit match.
- Broad configured plausibility range.
- Valid collection time; future time tolerance is five minutes.
- Optional coordinate bounds.
- Possible duplicates by site, parameter, time, value and unit. Equivalent time zones match.

Ranges are project review defaults, not environmental standards. Passing a check does not establish measurement accuracy, ecological quality or water safety. A human review note and zero unresolved findings are required for acceptance. Rechecks append a new reading and reason without overwriting the original. Requesting a recheck does not repair the value automatically.

## Storage and export

The frontend stores the current session in `localStorage` under `brook-workbench-v1`. No account, server upload, cloud database or AI provider is used. Browser storage is editable and can be cleared. This is not a tamper-proof record system. The downloadable audit JSON includes originals, revisions, review decisions, sources and synthetic labels. It is an archive, not a restore format.

FHIR export produces an R4 collection `Bundle` with `Location` and `Observation` resources. It includes accepted, currently valid readings only, absolute UUID references, project-local parameter codes, UCUM units where mapped and audit notes. Turbidity uses a display unit without claiming a mapped UCUM code. **OneAquaHealth profile conformance has not been validated.** The app does not upload to the organizer's sandbox.

## Validation and limits

Run `node tests/run.mjs` for 18 focused domain tests. These verify input handling, duplicate checks, review gating, immutable originals and export exclusion. They do not establish real-world ecological validity or field usability. Tests also cover impossible dates, duplicate exclusion, reopening excluded readings, inherited parameter names, nonnumeric GPS and the complete import-to-export workflow.

This MVP uses deterministic support, not an AI model. The challenge explicitly includes validation checks and human review. A later AI explanation layer should be evaluated against these rules and fail safely without changing measurements. Reviewer identities and qualifications are not authenticated. Field observations and validation ranges need independent domain review before a real deployment.

## Submission material

- [Evidence and challenge fit](docs/evidence.md)
- [Submission draft](docs/submission.md)
- [Demo storyboard](docs/demo-storyboard.md)
- [Ready-to-read narration](docs/demo-narration.txt)
- [Submission readiness](docs/submission-readiness.md)

Do not claim a prize probability. The available evidence supports relevance to the challenge, not a prediction of how unknown judges will rank unknown final submissions.

## Component credits

[shadcn/ui](https://ui.shadcn.com) uses its MIT license. [Rare UI](https://rareui.com) components use the exact plain-MIT upstream snapshot `c9a745c9cc04376f5a1abbd62d5fae9ea589944b`. Full copyright and permission notice is retained in `licenses/rare-ui.txt`; source hashes and license history are in [docs/rareui-provenance.md](docs/rareui-provenance.md). Current registry copies have different terms and are not used.
