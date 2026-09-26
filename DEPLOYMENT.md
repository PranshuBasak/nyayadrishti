# Deployment

## Sites

The selected Sites project is persisted in `.openai/hosting.json`; reuse its ID. `npm run build:sites` creates the OpenNext Worker build. `npx wrangler deploy --dry-run --outdir dist/sites` bundles the Worker without publishing to Cloudflare. Deployment uses the Sites connector, not a direct Wrangler deployment.

Set runtime secrets `GEMINI_API_KEY` and optional `GEMINI_API_KEY2` through `GEMINI_API_KEY5`. Set `GEMINI_MODELS=gemini-3.5-flash-lite,gemini-3.1-flash-lite`, `GEMINI_LIVE_MODEL=gemini-3.8-live`, `APP_ORIGIN` to the public origin, and `SITES_RUNTIME=1`. Never include secret values in a deployment archive.

Push the exact commit to both GitHub `main` and the Sites source repository. Package from that committed state, save a Sites version, deploy it, and verify the public URL and all server routes. Source repository credentials are short-lived and must not be saved in Git or remote URLs.

## Vercel fallback

1. Import `PranshuBasak/nyayadrishti` from GitHub; production branch `main`, root directory `.`.
2. Use the Next.js preset, Node.js 22, install `npm ci`, build `npm run build`, and the default Next.js output.
3. Add the server-side Gemini variables above as sensitive production environment variables. Do **not** set `SITES_RUNTIME` on Vercel. Set `APP_ORIGIN` to the resulting production origin and redeploy if the initial domain was not known.
4. Ensure the production site permits public access without evaluator login. Test `/`, `/api/gemini`, a text request and a Live connection over HTTPS.

No static export is sufficient: the application needs server routes for generation and short-lived token issuance. Live audio travels directly between the browser and Gemini, so the host does not need a long-running WebSocket proxy.

## Operational limits

The throttling is per instance and is not an authentication system or a global billing ceiling. Monitor provider usage; configure provider-side budgets/quotas before wider use. Never put credentials into `NEXT_PUBLIC_*`. Replace any key exposed outside its intended secret store.
