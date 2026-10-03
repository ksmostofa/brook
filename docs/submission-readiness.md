# Submission readiness

## Completed in this repository

| Requirement or flow | Evidence |
|---|---|
| Working prototype | React app builds for production; no credentials needed for its core workflow |
| Clear track fit | Track 3 validation checks, explainable support and human review; no model claim |
| Import | CSV and JSON append to a session; malformed structures fail before partial import |
| Repair | Rechecks append corrected readings and a reason; originals remain intact |
| Reviewer decision | Notes required; unresolved findings block acceptance |
| Duplicate handling | A reviewer can exclude a confirmed copy without modifying its timestamp |
| Archive | Excluded records, revisions and decisions stay in local storage and audit JSON |
| Export | Accepted, currently valid readings only; FHIR R4 Bundle and Location references |
| Honest demonstration | Default fixture and downloadable example are labelled synthetic |
| Reproducible checks | `npm test` runs 18 focused tests, including a 2,000-row collision check and complete flow |
| Submission writing | `docs/submission.md` describes the actual MVP and limits |
| Demo preparation | 4½-minute storyboard and narration ready; final recording not claimed |

## External deliverables to attach

The parent deployment workflow must supply the public repository link, working hosted-prototype link and recorded 3–5 minute demonstration link. Those are publishing tasks, not missing scientific claims.

The participant must complete their own Devpost enrollment and account-specific eligibility declarations. Do not guess account fields, team membership, terms acceptance or student verification details. The organizer's latest update permits solo participants and ongoing registration.

## Work that is useful but not falsely marked complete

- OneAquaHealth implementation-guide validation and sandbox integration.
- Actual citizen-scientist usability sessions and paired professional field samples.
- Authenticated shared review and a durable audit backend.
- An evaluated AI explanation layer, if added later.

These do not prevent demonstration of the current proof of concept. They do prevent claims that the prototype validates ecological truth, guarantees safe water, uses live organizer data or already runs an AI model.
