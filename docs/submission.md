# Brook submission draft

## Tagline

Check the reading. Keep the evidence.

## Track

Primary: Track 3, AI-Supported Assessment. Brook implements the challenge's validation checks, explainable support and human review. The current MVP uses deterministic rules and does not run an AI model. Secondary alignment: Citizen Science UX and Digital Health Standards.

## Problem and inspiration

A field reading can be wrong for ordinary reasons: a decimal was missed, a unit was copied incorrectly, the clock used a different time zone, or the same observation was imported twice. Those errors become harder to notice after they enter a dashboard. Citizens need a clear explanation and a practical next step. Reviewers need the original record.

## What Brook does

Brook imports CSV or JSON and checks context, values, units, times, coordinates and possible duplicates. Each finding explains what triggered it and how to recheck. A recheck adds a reading and reason while preserving the original. A confirmed duplicate can be excluded with a reviewer reason, so nobody needs to fabricate a different timestamp to make the queue pass. Excluded entries stay in the archive. A reviewer must write a note and resolve findings before acceptance. FHIR R4 export includes accepted readings only, with source and review history.

The demo fixture is entirely synthetic and visibly labelled. Imported data retains its file source. Brook does not calculate a water-safety score, verify contamination or diagnose risks to human health.

## Target users and expected impact

Citizen scientists collecting urban-stream observations and researchers who review them. The expected benefit is fewer avoidable collection errors and a shorter path from a questioned reading to reviewable evidence. This benefit has not been measured in a field study.

## How we built it

TypeScript validation functions, React, Vite, the requested shadcn Luma preset and selected RareUI components. Browser-local persistence keeps the prototype usable without accounts or an external backend. Source records, revisions and decisions remain inspectable in the downloadable audit log. FHIR output uses project-local parameter codes and mapped UCUM units where available.

## Challenges

A suspicious reading does not prove unhealthy water. We kept plausibility checks separate from ecological claims. A corrected measurement also does not make the original disappear, so the review flow appends revisions and recalculates findings. Duplicate detection compares data rather than trusting distinct IDs.

## Validation

Eighteen passing domain tests check missing values, unit mismatches, range findings, future timestamps, coordinate bounds, equivalent-time-zone duplicates, preserved originals, impossible calendar dates, duplicate exclusion, review restrictions, synthetic labels, CSV parsing, malformed imports and the complete import, repair, review and accepted-only export sequence. These are software tests. They do not establish field accuracy or OneAquaHealth profile conformance.

## Limitations and next steps

Reviewer identity is local and unauthenticated. Browser storage is editable. FHIR output still needs validation against the OneAquaHealth implementation guide. Test the workflow with citizen scientists and paired professional observations before deployment. Add a shared review backend and evaluate optional AI explanations only after the data-quality rules are sound.

## AI assistance disclosure

AI coding assistance helped research, write code and documentation. No AI model generates, interprets or validates observations inside the running MVP. Demo records are synthetic fixtures written for testing.

## Required links before submission

- Public repository URL.
- Working hosted prototype URL.
- Recorded 3–5 minute demo URL.
- Team/student eligibility details completed by the participant.
