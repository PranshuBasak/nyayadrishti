# Verification record — 26 September 2026

## Submission pass: Gemini Live and model fallback

- Upgraded to Next.js 16.3.6, React 19.3 and PDF.js 6.3.289. Production build and TypeScript checks passed; `npm audit --omit=dev` reported zero vulnerabilities, including after adding the OpenNext adapter.
- Added 26 localized labels to each dictionary: 167 strings in all 15 languages. Sanskrit Live speech is explicitly unavailable; Sanskrit text chat remains supported.
- Automated provider tests passed: model priority, two-attempt bound, credential deduplication/rotation, cooldowns, no retry on authentication/safety/project-wide quota errors, grounding enforcement, input sizes, origin checks and Live token rate limiting.
- Synthetic Live tests passed: audio input, all output parts, interruption, finalized captions, duplicate completion handling, mute, image frames, one resumable reconnect, no replay, cleanup, late-event protection and real AudioWorklet PCM resampling.
- Real Gemini 3.8 Live smoke test: constrained ephemeral token creation succeeded; synthetic document-context question returned 12 audio chunks and the caption “The monthly rent is 10,000 INR.”
- Real Live vision smoke test: synthetic receipt frame returned seven audio chunks and “The amount is INR 10000.” This verified the amount; the requested date was not returned.
- Browser text chat after the model migration correctly answered the monthly rent from clause 1. PDF.js 6 imported the real synthetic PDF and extracted its introduction plus three numbered clauses without console errors.
- Browser Live connection and End control worked. Microphone capture remained pending in the in-app browser, exposing an early “Listening” status bug. Startup now waits for capture readiness, times out unresolved permission after 15 seconds, and releases late-acquired streams.
- Physical microphone conversation, camera capture and interactive screen-picker flows remain unverified; successful API audio/vision and synthetic transport tests are not claimed as physical-device tests.
- OpenNext built successfully on Windows; Wrangler dry-run bundled the Worker at approximately 1.67 MB gzip. Deployment outcome and final browser checks are recorded below as they complete.

The sections below record the earlier workspace pass and its limitations at that time.

The application was built with `npm run build` and served with **`npm run start`**, as requested. Browser checks used the Codex in-app Chromium browser and synthetic test documents, never personal legal files.

## Passed

- Production compilation and strict TypeScript checks.
- `npm test`: all 15 locale dictionaries have the same 141 nonempty keys; regional dictionaries use native scripts; segmentation, risk classification, comparison (including duplicate lines), and report HTML escaping.
- Switched through Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Nepali and Sanskrit in the browser. Each changed the heading and controls; Urdu changed document direction to RTL.
- Added a four-clause agreement through the paste-text dialog; all four clauses and attention counts appeared.
- Uploaded `tests/fixtures/sample-agreement.pdf`; browser extraction produced the introduction and three numbered clauses. No browser errors were recorded.
- A live Hindi clause explanation preserved the INR 10,000 rent and returned Hindi analysis and questions.
- Live chat correctly cited clause 1 for INR 10,000 monthly rent and clause 3 for 30 days' notice.
- Follow-up chat retained context and correctly calculated INR 30,000 for three months.
- Uploaded `sample-receipt.png`; live vision correctly extracted **15 September 2026**, **INR 10,000**, and **TEST-1001**.
- Comparison detected exactly two changes and two unchanged clauses. AI comparison correctly identified rent increasing from 10,000 to 12,000 and notice decreasing from 30 to 15 days.
- Saved synthetic intake facts, checked evidence, and a dated timeline event. Generated an editable communication draft using those facts.
- Full browser reload restored the uploaded document, case facts, evidence selection, timeline and generated draft.
- At the 390px viewport setting, the mobile navigation opened and worked. English and Urdu layouts had equal document client and scroll widths, with no horizontal overflow.

## External limits / not fully verified

- Gemini 2.5 Flash hit its free-tier request quota. The existing key successfully served Gemini 3 Flash Preview, which is now selected through `GEMINI_MODEL`. Subsequent live legal research returned a **429 quota error**; the user explicitly requested retaining the current key and documenting this limit. The app shows a localized failure instead of invented results. Official portal links remain available.
- Direct retrieval probes to the government sites also failed or timed out on this machine; these were not presented as successful research.
- Raw microphone, physical camera and interactive screen-sharing permission flows were not granted or fully tested. Dictation and read-aloud depend on browser/language support and installed voices. Image upload and vision were verified independently.
- The optional telephone gateway and Gemini Live bidirectional audio session from the long-term goal are not implemented. The working browser voice path is dictation plus read-aloud.
- The in-app browser did not initially emit a download event for a programmatically clicked Blob URL. Export was revised to a real download link, with an in-app report preview and print action. Final checks are recorded below.

## Final build checks

- Rebuilt the final source and restarted with `npm run start`; build and strict type checks passed.
- `node scripts/verify-production.cjs` passed: missing/oversized prompts and invalid image types returned 400; failures returned no fabricated text; the local PDF worker returned 200; the configured key was absent from all browser JavaScript bundles.
- The final report preview displayed the entered party, INR 20,000 amount, evidence names, 15 September event, flagged clauses and generated communication. The real Blob download link was present with the correct filename. This in-app browser still did not expose a download event; Chrome was not available as another automated browser. File delivery and OS print/PDF saving therefore remain unverified here, rather than being reported as passed.
- Tamil remained selected after a full reload, including the corrected Tamil heading.
- Chat history including the synthetic receipt result survived reload. The privacy dialog opened and closed, and the high-attention filter showed the matching deposit and painting clauses.
- Browser console checks reported no application errors during these successful flows.

## Reproduce

Run `node scripts/create-test-fixture.cjs` for synthetic PDF/TXT fixtures. Run `npm test`, `npm run lint`, `npm run build`, then `npm run start`. Browser data is scoped to this origin and browser profile. Do not clear a user's existing workspace merely to repeat a test.

Translation dictionaries were machine-assisted and received targeted corrections; broad native-speaker linguistic review remains advisable before publication.
