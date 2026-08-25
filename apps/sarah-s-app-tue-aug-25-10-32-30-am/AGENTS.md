# sarah-s-app-tue-aug-25-10-32-30-am

This app is part of a Datadog Apps workspace. Shared guidance — including layout, dependencies, testing policy, and how changes ship — lives at the workspace root; read it before assuming anything not covered below.

## Read relevant guides
- Embedded app context / routing / storage: ../../docs/agents/runtime-context.md
- Backend functions (*.backend.ts): ../../docs/agents/backend-functions.md
- Local dev / auth / build / upload: ../../docs/agents/build-upload-auth.md
- CI/CD (GitHub Actions deploy workflow): ../../docs/agents/cicd.md
- Data access (DDSQL vs. Action Catalog, Connections, datastores): ../../docs/agents/data.md
- Triggering or polling Workflow Automation from a backend function: ../../docs/agents/workflow-automation.md
- Upgrading `@datadog/vite-plugin` or `@datadog/action-catalog`: ../../docs/agents/upgrading.md
- Workspace overview (layout, dependencies, testing, shipping/CI): ../../AGENTS.md

## This app
- This app owns its unique `apps.identifier` in `./vite.config.ts` — never share or copy it.
- Run locally: `npm run dev -w apps/sarah-s-app-tue-aug-25-10-32-30-am` (from the workspace root) or `npm run dev` (from this directory).
- Upload: `npm run upload -w apps/sarah-s-app-tue-aug-25-10-32-30-am`.

## Testing

Storybook stories are not required for this app right now — skip them unless explicitly asked. Playwright is still encouraged for browser validation when available, especially for visual/design changes. Validate with `npm run dev`, `npm run build`, and `npm run typecheck`/`npm run lint`.

## Rules
- Keep secret-dependent work and privileged API calls in backend functions.
- Never hardcode API keys, app keys, or OAuth tokens.
- Prefer the generated npm scripts; this workspace uses npm.
- For any workspace, dependency, lockfile, or pull-request change, follow `Required lockfile gate before opening or updating a PR` in ../../AGENTS.md. That root section is the source of truth; do not create an app-local lockfile.
