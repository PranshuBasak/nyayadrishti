# NyayaDrishti — clarity before your next step

**Challenge: AI for Legal Assistance & Access.** A multilingual, local-first legal document companion for Indian tenants, employees, freelancers and consumers who need to understand an agreement and prepare informed questions.

## Approach and decision logic

1. Import a PDF/TXT or paste an agreement. PDF extraction and deterministic clause segmentation happen in the browser.
2. Review transparent preliminary keyword flags. Flags identify topics for attention; they do not establish legality, enforceability or safety.
3. Ask questions with the selected clause, relevant document excerpts and recent conversation in context. Preserve original amounts, dates and quotations; ask for missing facts instead of inventing them.
4. Compare actual wording changes, collect case facts and evidence, build a timeline, and generate editable communications and a report.
5. Use separately grounded legal research for current sources. A missing source or exhausted search quota is shown as a failure, never replaced with fabricated citations.

## GenAI services

| Capability | Service and behavior |
|---|---|
| Explanations, translations, chat, images, comparison and drafts | Google Gemini API: `gemini-3.5-flash-lite`, then `gemini-3.1-flash-lite` |
| Legal research | Gemini with Google Search grounding; requires actual returned source links |
| Live voice and vision | `gemini-3.8-live`: two-way audio, interruption, captions and optional camera/screen frames |
| Dictation and read-aloud | Browser speech capabilities; these are separate from Gemini Live |

The text router makes at most two attempts within a 59-second request deadline, with a 25-second provider-attempt timeout. It skips model/credential pairs in cooldown, surfaces retry progress and never retries invalid credentials, safety refusals or project-wide quota restrictions. Optional server credentials are deduplicated and distributed across requests. Keys from the same Google project share quota; this does not bypass provider limits. Per-instance cooldowns and counters reset on process restart.

## Gemini Live

Select **Ask Nyaya → Start live conversation**. The server issues a single-use, five-minute token constrained to the selected model and legal-assistant context; permanent keys never reach the browser. The browser connects directly to Gemini over WSS using `@google/genai`.

AudioWorklet capture produces 16 kHz PCM; responses play at 24 kHz. Interruptions stop queued audio. Camera and screen sharing require explicit activation, show a preview and send at most one JPEG frame per second. Only one visual source is active at a time. Raw recordings are not stored. Finalized captions are saved in the local conversation, with interrupted replies marked.

End, navigation, document/language changes, session expiry and failures release capture and playback resources. One resumable reconnect is allowed for transient connection loss; microphone audio is never buffered for replay. An unresolved microphone permission request times out. Live uses supplied document/research context; current legal research remains a separate action.

## Languages and accessibility

English plus Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Nepali and Sanskrit: **167 bundled UI strings per language**. Urdu uses RTL. The interface includes responsive navigation, labelled controls, keyboard operation, visible focus and text captions. Original document wording remains unchanged; translation is explicit. Sanskrit uses text chat because it is absent from the documented Live speech list. Machine-assisted translations need broader native-speaker review before a production launch.

## Run locally

Requires Node.js **22.20+**. Copy `.env.example` to `.env.local`, then set your server credentials. Never use `NEXT_PUBLIC_` for secrets.

```sh
npm ci
npm run build
npm run start
```

Open http://localhost:3000. Rebuild and restart after source changes. `GEMINI_MODELS` controls the two-model order; `GEMINI_LIVE_MODEL` controls Live. Optional `GEMINI_API_KEY2` through `GEMINI_API_KEY5` support independently authorized credentials. Do not paste secrets into issues, screenshots, chat or Git.

## Architecture, privacy and security

- Next.js/React UI with IndexedDB for documents, conversations, cases and preferences. No shared document database or background uploads.
- `POST /api/gemini`: validates requests and uses the model router; JSON clients remain supported, while the UI receives newline-delimited status/result events. Responses include `modelUsed`.
- `POST /api/live/token`: accepts language and bounded context (24,000 characters), returns an ephemeral token/model/expiry, and disables caching.
- Same-origin checks, bounded bodies, sanitized errors, provider timeouts and per-instance limits: five generation requests and two Live token starts per client per minute; two simultaneous server provider calls.
- Set `APP_ORIGIN` to the exact public HTTPS origin. Platform-managed IP headers are used only on the configured platform. These are demo safeguards, not distributed authentication or a global spending cap; enforce provider quotas and monitor usage.
- AI requests transmit selected content to Google. Browser dictation may use its speech provider. Provider retention policies apply. Users can clear local data through Privacy & storage.

## Validation

```sh
npm test
npm run lint
npm run build
npm audit --omit=dev
# With npm run start running:
node scripts/verify-production.cjs
# Optional real-provider synthetic checks (consume quota):
node scripts/probe-live.cjs
node scripts/probe-live.cjs --vision
```

Tests cover locale completeness, segmentation, real comparison, HTML escaping, fallback/cooldowns, credential deduplication, grounding enforcement, request guards, synthetic Live transport, interruption, reconnect, transcript completion and PCM resampling. See [TESTING.md](TESTING.md) for executed browser/provider checks and unverified hardware flows.

## Deployment and submission

Public repository: https://github.com/PranshuBasak/nyayadrishti. Only `main` is used. Source, synthetic fixtures and lockfile are included; dependencies, build output and secrets are excluded. See [DEPLOYMENT.md](DEPLOYMENT.md) for Sites packaging and the Vercel fallback.

The application is legal information and preparation, not professional representation. Scanned PDFs need OCR or an image. The telephone gateway is not implemented. Provider quotas, model access and browser permissions can limit availability; an “unlimited” RPD label does not guarantee unlimited tokens or concurrency. Report preview is tested; OS download/print completion and physical-device checks are reported separately.
