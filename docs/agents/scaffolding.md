# Scaffolding new apps

Pitfalls observed in this workspace when scaffolding a new app with
`npm init @datadog/apps` (vite-react template) and how to fix them. Apply
these before the first root install / lockfile gate.

## 1. Generated npm scripts use an unresolvable CLI

The generated `package.json` scripts call `npx datadog-apps dev|build|upload`.
No `datadog-apps` binary is published to the public registry or shipped in this
workspace, so those scripts fail with an npm 404. Replace them with the direct
Vite scripts used by the existing apps:

```json
"dev": "vite",
"build": "vite build",
"upload": "DD_APPS_UPLOAD_ASSETS=1 vite build"
```

## 2. React version must match the root overrides

The template generates the app with `react`/`react-dom` `^19.x`. The root
`package.json` pins React via `overrides` (`^18.3.1`), and the workspace rule
is that app ranges must match the root overrides. Change the generated app's
`react` and `react-dom` to `^18.3.1` **before** the first root install.

## 3. npm can still materialize a duplicate React

`@datadog/apps-frontend` (and other workspace deps) declare the peer range
`react: "^18.0.0 || ^19.0.0"`. npm resolves multi-major peer ranges to the
highest satisfying version and installs a nested `react@19` copy next to the
app, even though the root override pins `^18.3.1` (npm does not apply plain
overrides to peer resolutions). Two React instances in the bundle crash hooks
at runtime and the app renders blank with
`Cannot read properties of null (reading 'useEffect')` or
`Cannot read properties of undefined (reading 'ReactCurrentDispatcher')`.

Fix both layers:

1. Force the peer resolution with a scoped override in the **root**
   `package.json` (the `$react` reference resolves to the root `react`
   override), then remove and re-add `@datadog/apps-frontend` in the app's
   `package.json` and reinstall — npm keeps an already-recorded nested
   resolution otherwise, so a fresh re-resolution of that subtree is needed:

   ```json
   "overrides": {
     "react": "^18.3.1",
     "react-dom": "^18.3.1",
     "@datadog/apps-frontend": { "react": "$react", "react-dom": "$react-dom" }
   }
   ```

   Verify with: the root lockfile must contain no
   `apps/<app>/node_modules/react` entry.

2. Add a belt-and-braces guard in the app's `vite.config.ts` so all react
   imports resolve to the single workspace React instance even if the nested
   copy reappears:

   ```ts
   resolve: {
       dedupe: ['react', 'react-dom'],
   },
   ```

3. Clear Vite's dep cache (`rm -rf node_modules/.vite`) after fixing
   resolution, otherwise stale pre-bundled chunks keep the crash alive.

## 4. Empty `DD_SITE`/`DATADOG_SITE` env vars break dev and build

The Datadog Vite plugin reads `DATADOG_SITE`/`DD_SITE` from the environment
itself and rejects an **empty-string** value as an unsupported site, even when
the config file supplies a fallback. In environments where `DD_SITE` is set
but empty, `vite dev`/`vite build` fail with:

```
Invalid Datadog plugin configuration:
  - DATADOG_SITE/DD_SITE "" is not a supported Datadog site.
```

Guard the app's `vite.config.ts` before the plugin is constructed:

```ts
for (const key of ['DATADOG_SITE', 'DD_SITE']) {
    if (process.env[key] === '') {
        delete process.env[key];
    }
}
```

Or run the command with `env -u DD_SITE`. (CI is unaffected.)

## Checklist for a new scaffolded app

1. Rewrite the npm scripts per (1).
2. Set `react`/`react-dom` to `^18.3.1` per (2).
3. Add the scoped root override and `resolve.dedupe` guard per (3).
4. Add the empty-site env guard per (4).
5. Follow the required lockfile gate in the root `AGENTS.md`.
