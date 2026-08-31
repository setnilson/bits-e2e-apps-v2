# Build, Auth, Deploy, And Publish

This scaffold uses npm. Prefer the scripts in `package.json` over ad hoc commands.

## Scripts

- `npm run dev` — start the local Vite dev server.
- `npm run typecheck` — TypeScript check without emitting files. Use this for credential-free validation.
- `npm run lint` / `npm run lint:fix` — run ESLint.
- `npm run build` — production build (does not deploy by default).
- `npm run deploy` — build, upload, and publish the app live.
- `npm run publish` — publish the most recently uploaded version without rebuilding.

## App identity (do not change)

- `id` in `datadog-app.config.json` is this app's permanent identity. It was generated once when the project was scaffolded.
- Every upload updates the app that matches this identifier. **Never change it.** Changing it — including pasting the app's UUID from App Builder into it — makes the next upload create a brand-new duplicate app instead of updating the existing one.
- `id` is NOT the app UUID shown in App Builder. The UUID is assigned by Datadog; the id is a stable local key. Do not copy one into the other.

## Auth

Apps use **OAuth by default**. On first `npm run dev`, a browser window opens for Datadog login and the token is cached in the system keyring. No credentials needed in advance.

**API key fallback** — use when OAuth isn't available (headless CI, restricted networks):

1. Confirm `.env.local` is gitignored — the scaffold includes `*.local` in `.gitignore` by default.
2. Create `.env.local` at the project root with placeholders:

```
DD_API_KEY=REPLACE_WITH_YOUR_API_KEY
DD_APP_KEY=REPLACE_WITH_YOUR_APP_KEY
```

3. Open the file for editing — do not ask users to paste key values into the conversation:

```bash
cursor .env.local 2>/dev/null || code .env.local 2>/dev/null || open .env.local
```

4. Direct the user to replace the placeholders. Keys are at:
   - API keys: `https://app.datadoghq.com/organization-settings/api-keys`
   - Application keys: `https://app.datadoghq.com/organization-settings/application-keys` — the key needs **two scopes**: **Actions API Access** and **Apps**

Vite reads `.env.local` automatically once real values are in place.

**`.env.local` not being picked up** — the scaffolded `vite.config.ts` reads credentials via `process.env`, which does not include `.env.local` at config evaluation time. Fix with Vite's `loadEnv`:

```ts
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [datadogVitePlugin({ auth: { apiKey: env.DD_API_KEY, appKey: env.DD_APP_KEY } })],
    };
});
```

Restart the dev server after updating `vite.config.ts`.

## Non-US1 site

Set `datadogSite` in `datadog-app.config.json` so local dev and deploys target the right site:

```json
{ "datadogSite": "<YOUR_DATADOG_SITE>" }
```

## Deploy

Build, upload, and publish in one command:

```bash
npm run deploy
```

With API keys (CI environments):

```bash
export DD_API_KEY="<YOUR_API_KEY>"
export DD_APP_KEY="<YOUR_APPLICATION_KEY>"
npm run deploy
```

A successful deploy prints a Datadog URL for the app.

**Deploy without publishing** — upload as a draft without going live:

```bash
npm run deploy -- --no-publish
# or
DD_APPS_PUBLISH=false npm run deploy
```

`DD_APPS_PUBLISH=false` is useful in CI when publishing is a separate step.

## Publish

Publish the most recently uploaded version without rebuilding:

```bash
npm run publish
```

Publish a specific version by ID:

```bash
npm run publish -- --version <version-id>
```

When using `--version` without a cache file, set `DD_APPS_IDENTIFIER` to the app's identifier.

**Older scaffolded projects** — if `deploy` and `publish` scripts are missing, add them to `package.json` (requires `@datadog/vite-plugin` >= 3.2.0):

```json
{ "scripts": { "deploy": "datadog-apps deploy", "publish": "datadog-apps publish" } }
```

## Troubleshooting

**401 / missing authentication token / credentials not configured**

- OAuth: if the browser window didn't open, the environment may not support it. Fall back to API keys.
- API keys: verify `DD_API_KEY` and `DD_APP_KEY` are set and the application key has both **Actions API Access** and **Apps** scopes.
- Check `datadogSite` in `datadog-app.config.json` matches the credentials' Datadog site.

**403 "you do not have access to this app" on upload**

The application key needs both scopes enabled — not just one:

1. **Actions API Access** — required for backend function execution.
2. **Apps** (or **App Builder**) — required for uploading and publishing.

Go to `https://app.datadoghq.com/organization-settings/application-keys`, confirm both scopes, or create a new key with both.

**Build succeeds but nothing deploys**

- Use `npm run deploy`, not `npm run build`, when the intent is to deploy.
- Check whether `DD_APPS_PUBLISH` is set to `false` in the environment — the app uploads as a draft but does not go live. Unset the variable or run `npm run publish` separately.
- Confirm `dryRun` in `vite.config.ts` is not `true`.
- Confirm `DD_APPS_UPLOAD_ASSETS` is set — `npm run deploy` does this automatically.

**Build fails with missing credentials**

- Current scaffold versions may make `npm run build` exercise Datadog deploy behavior.
- Cache OAuth credentials first (`npm run dev`), or set `DD_API_KEY` and `DD_APP_KEY`.
- For credential-free validation, prefer `npm run typecheck`.

**Node or scaffolding errors**

- Check `package.json` `engines.node` for the supported Node.js versions.
- Use Volta, nvm, or fnm to switch versions. Prefer a current Node 22 release when debugging.

**Datadog site mismatch**

- Inspect `datadog-app.config.json` for the configured site and confirm CI uses the same value.
