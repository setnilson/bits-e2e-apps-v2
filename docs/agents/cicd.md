# CI/CD

This monorepo ships a deploy workflow at `.github/workflows/deploy-datadog-apps.yml`. You do not need to add `DataDog/apps-github-action` — the workflow uploads each app through its own `upload` script, which respects the npm workspace layout.

## What the workflow does

- **On pull requests** touching `apps/**`, `packages/**`, or the root package manifests: runs `npm ci`, checks every app manifest against the root React overrides, then runs `npm run typecheck`, `npm run lint`, and `npm run build` as merge gates. No Datadog credentials are used.
- **On pushes to the repository's default branch**: runs `npm ci --ignore-scripts` and the same React-alignment check, then detects which `apps/<name>` folders changed and uploads only those, one matrix leg per app, via `npm run upload -w apps/<name>`. Uploads do not run when the lockfile or alignment gate fails.

Re-uploading an app **updates the existing Datadog App** rather than creating a new one, because each app's `vite.config.ts` carries a stable `apps.identifier`. So editing an app becomes: open a PR, merge it, and the app updates in Datadog.

Before opening, updating, or merging a create-app pull request, follow `Required lockfile gate before opening or updating a PR` in the root `AGENTS.md`. It is the source of truth for lockfile reconciliation and validation.

The default branch is read from `github.event.repository.default_branch`, so the workflow works whether your repo uses `main` or `master`.

## Required secrets

Store `DATADOG_API_KEY` and `DATADOG_APP_KEY` as [encrypted secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) in the repository or organization settings. Prefer an application key owned by a [service account](https://docs.datadoghq.com/account_management/org_settings/service_accounts/) rather than a personal user key — a personal key stops working when that user is deactivated, silently breaking the pipeline. The key needs both **Actions API Access** and **Apps** scopes. The workflow passes the secrets to the build as `DD_API_KEY` / `DD_APP_KEY`, which the Datadog vite plugin reads to authenticate the upload.

## Datadog site

The deploy site lives in the root `package.json` under `datadogApps.site` (default `datadoghq.com`). Every app's `vite.config.ts` reads it, so both local builds and CI target the same site. Set it once — e.g. `npm init @datadog/apps --monorepo --site <site>` when scaffolding, or edit the marker — and keep the API/App keys from that same site. `DD_SITE` in the environment overrides the marker for one-off targeting.

**Never special-case a site value in `vite.config.ts`.** The generated `auth.site` expression must stay exactly `process.env.DD_SITE || rootManifest.datadogApps?.site || 'datadoghq.com'` (or, for standalone apps, `process.env.DD_SITE || 'datadoghq.com'`). Do not add logic that excludes, overrides, or forces a fallback for a specific site (e.g. treating `datad0g.com` as invalid and rewriting it to `datadoghq.com`) — this has caused silent 403s when API-key auth against a configured staging site authenticated against the wrong org instead. If you are regenerating or hand-editing an app's `vite.config.ts`, keep the site expression unmodified from this template.
