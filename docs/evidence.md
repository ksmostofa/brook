# Evidence and project decision

Research date: 3 October 2026. Sources below are organizer pages, an HL7 specification, and current entrants' own descriptions and repositories.

## Official requirements

[OneAquaHealth overview](https://oneaquahealth-ieee-hackathon.devpost.com/) describes Track 3 as AI-supported assessment that supports human judgment. It explicitly suggests validation checks, explainable support and human review. The event aims to improve urban freshwater monitoring and connect ecosystem health with human, animal and environmental health.

[Official judging rules](https://oneaquahealth-ieee-hackathon.devpost.com/rules) weight impact and mission alignment 30%, innovation 20%, technical implementation 20%, UX 15%, and feasibility 15%. Deliverables include a public repository, working prototype or proof of concept, project description with track alignment, and a 3–5 minute demo.

[Organizer deadline extension](https://oneaquahealth-ieee-hackathon.devpost.com/updates/46660-deadline-extended-to-october-4-keep-innovating-keep-submitting) explicitly permits individual participation and new registration. This is newer than the overview's team-required badge and stale registration dates in the rules. Submission deadline is 4 October 2026 at 21:00 PDT, which is 5 October at 13:00 JST. The overview lists students and international participation, subject to exclusions.

## Why this particular project

[Neer](https://devpost.com/software/neer), a current entrant, describes a broad sensor/citizen dashboard with uncertainty handling, live sensors, audited rules and extensive tests. Its [public repository](https://github.com/dapphari007/neer) provides a stronger comparison than registration counts. [AquaPulse](https://devpost.com/software/aquapulse) also covers water-health dashboards, biological scoring, simulation and citizen reports; [repository](https://github.com/Naveen57990/AquaPulse).

Brook instead concentrates on a narrow operational gap: whether a field reading is ready for use, what to collect next, and how to keep the original evidence. Differentiation is an inference from these inspected entrants. It is not proof that no competitor has a similar workflow.

The demo must show the entire sequence from a bad observation to a recheck, human acceptance and export. A polished dashboard alone does not demonstrate data quality. Synthetic fixture tests offer reproducible software evidence, not clinical or ecological validation.

## Standards basis

[HL7 FHIR R4 Observation](https://hl7.org/fhir/R4/observation.html) supports measurements with a Location as subject. Brook uses this resource alongside Location and a collection Bundle. It does not claim certified interoperability or OneAquaHealth profile conformance. The indexed OneAquaHealth implementation-guide pages could not be retrieved live during this research.

## Evaluation plan against the rubric

| Criterion | Working evidence | Remaining evidence needed |
|---|---|---|
| Impact, 30% | Detects dirty observations before export; guides rechecks | Professional review and paired field samples |
| Innovation, 20% | Original/recheck/reviewer trail in one compact workflow | Comparison with actual existing collection tools |
| Technical implementation, 20% | Pure checks; import; local persistence; accepted-only FHIR output | Organizer profile validation and integration test |
| UX, 15% | Plain-language findings and precise next action | Real citizen-scientist usability sessions |
| Feasibility, 15% | Browser-only demo; no credentials or paid inference | Shared authenticated review and data-retention design |

No credible previous winners of this event were found. Current winners are scheduled for 24 October. GitHub and public social searches did not provide a defensible win probability. Registration counts are not counts of eligible final submissions.
