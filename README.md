# NyayaDrishti

A local-first Indian legal document workspace. The active interface is in `src/components/workspace`, composed by `src/app/page.tsx`.

## Run

Copy `.env.example` to `.env.local` and set a valid **server-side** Gemini key and an available model. Never prefix the key with `NEXT_PUBLIC_`.

```sh
npm install
npm run build
npm run start
```

Open http://localhost:3000. `npm run start` serves the production build; rebuild and restart after changing source files.

## Implemented

- Responsive document workspace with keyboard-accessible clause selection, search and attention filters.
- Complete bundled UI dictionaries (141 strings each): English, Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Nepali and Sanskrit. Urdu uses RTL. Translation quality should receive native-speaker review before public release.
- PDF/TXT import and pasted text; PDF extraction uses a locally bundled worker. Documents and selected-document state restore from IndexedDB.
- Explicitly labelled preliminary keyword screening. On-demand AI explanations, faithful translation, draft alternative wording and extraction of obligations.
- Grounded chat with selected clause, relevant document content, recent conversation, research context and optional images. AI calls use the selected language.
- Browser dictation with review before sending; read-aloud when an appropriate system voice exists; camera and screen frame capture with explicit activation and cleanup. Frames are only sent when the user sends a message, and raw recordings are not persisted.
- Actual wording comparison between two documents, plus AI semantic explanation.
- Per-document case facts, evidence checklist, timeline, editable generated communication and printable/downloadable report.
- Search-grounded legal research with actual provider-returned source links and official portal links.
- Local-data clearing and accurate provider-processing notices. No canned legal advice is returned when AI requests fail.

## Boundaries

AI generation requires an available model, network access and quota. The configured key reached Gemini 2.5 Flash's free-tier quota during verification; Gemini 3 Flash Preview was successfully tested and configured instead. Keys are never returned to the browser. The application is intended for local use; add authentication, rate limiting and deployment hardening before exposing its AI endpoint publicly.

Scanned PDFs require OCR or a document image. Browser dictation is not a Gemini Live bidirectional audio session; language/device support depends on the browser and installed voices. Camera/microphone/screen permissions and real hardware need an interactive device check. The optional telephone gateway in the original goal is not implemented.

Original document wording and proper names remain unchanged when switching UI language. Use Translate for a clause or conversation message; explanations, drafts, comparison and research request the chosen language.

## Validation

```sh
npm test
npm run lint
npm run build
```

`npm test` checks locale completeness and native scripts, clause segmentation, attention flags, comparison changes and duplicate matching, and HTML escaping for reports. `npm run lint` performs strict TypeScript checking. See `TESTING.md` for browser checks and limits.
