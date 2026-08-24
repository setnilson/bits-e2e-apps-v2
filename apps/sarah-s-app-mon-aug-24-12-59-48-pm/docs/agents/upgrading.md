# Upgrading

## Primary packages

- `@datadog/vite-plugin`: Vite integration for local development, build, and deploy.
- `@datadog/action-catalog`: typed Action Catalog client for backend functions.
- `@datadog/apps-backend`: Datadog-provided helpers for backend function development.

Preserve the existing package manager and lockfile style.

## Before upgrading

Check release notes before changing versions:

```bash
npm view @datadog/vite-plugin version repository.url homepage
npm view @datadog/action-catalog version repository.url homepage
npm view @datadog/apps-backend version repository.url homepage
```

Inspect the current app:

```bash
npm outdated @datadog/vite-plugin @datadog/action-catalog @datadog/apps-backend
npm ls @datadog/vite-plugin @datadog/action-catalog @datadog/apps-backend
```

## Upgrade

```bash
npm install @datadog/action-catalog@latest
npm install @datadog/apps-backend@latest
npm install -D @datadog/vite-plugin@latest
```

After upgrading, verify:

- `vite.config.ts` Datadog plugin config, especially `auth.site`.
- `package.json` scripts — check for new `deploy` and `publish` scripts added in `@datadog/vite-plugin` 3.2.0+.
- Backend function imports from `@datadog/action-catalog/...`.
- Project-local instructions in `AGENTS.md`.

## Compare against a fresh scaffold

To pull in changes from the latest scaffolder without guessing:

```bash
tmp_dir="$(mktemp -d)"
npm create @datadog/apps@latest -- "$tmp_dir/base-app" --template vite-react -y --skip-post-scaffold
diff -ru "$tmp_dir/base-app/package.json" package.json
diff -ru "$tmp_dir/base-app/vite.config.ts" vite.config.ts
diff -ru "$tmp_dir/base-app/src" src
```

Port only the specific changes needed. Do not replace the app wholesale.

## Verify

```bash
npm run typecheck
npm run lint
npm run build
```
