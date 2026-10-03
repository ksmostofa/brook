# Four-minute demo storyboard

Record the working app, not slides. All example observations shown in this recording must retain the synthetic label. Do not describe the fixture as a real field study.

| Time | Screen action | Narration |
|---|---|---|
| 0:00–0:25 | Show queue, synthetic banner and findings count | A stream reading can have a missed decimal, wrong unit or duplicate timestamp. Brook makes the questionable evidence visible before it reaches an analysis. |
| 0:25–1:00 | Select BRK-002; read pH 74 finding; show disabled acceptance | This pH is outside our review range. The check explains why and asks for a repeat measurement. It does not assess water safety. |
| 1:00–1:45 | Record recheck; enter 7.4; write a reason; save | I record the repeat reading. The original 74 remains in the record. The new reading starts pending, and checks run again. |
| 1:45–2:15 | Enter reviewer note; accept; open original record and audit events | Passing rules is not the same as acceptance. A human records the review decision. The complete history stays inspectable. |
| 2:15–2:45 | Select wrong-unit or duplicate fixture | Other findings work the same way. Brook does not silently convert units or assume different IDs are different samples. |
| 2:45–3:15 | Import CSV template or small real-shaped JSON fixture | Citizen observations can come from existing collection tools. Imports append and begin pending. The filename stays attached. This example is also synthetic. |
| 3:15–3:40 | Export accepted FHIR JSON; show Observation, Location reference and notes | Only accepted, currently valid observations leave the review gate. The JSON contains the current value, site and history. OneAquaHealth profile validation is still pending. |
| 3:40–4:00 | Open Methods; briefly show test result in terminal if available | This MVP is deterministic and reproducible. Next we need field usability testing, professional paired measurements and organizer-profile validation. |

Before recording: reset the synthetic demo, clear old download files, set the browser to desktop width, and run `node tests/run.mjs`. Do not read test counts until the displayed run passes. Recording and submission are participant actions; this repository does not claim either has been completed.
