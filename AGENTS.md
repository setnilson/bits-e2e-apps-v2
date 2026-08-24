# bits-e2e-apps-v2 — Datadog Apps workspace

This is a Datadog Apps npm workspace. It can hold multiple apps, each independently developed, built, and uploaded.

Before editing, read this root `AGENTS.md` and every nested `AGENTS.md` that applies to the files you will touch.

## Layout

- `apps/<name>/` — each Datadog App lives in its own directory here.
- `packages/*` — optional shared libraries, depended on from apps via the `"*"` version range (npm workspaces links them locally). Create them with `npm init @datadog/apps --package <name>`.
- Shared config (root `package.json`, `tsconfig.base.json`) and `docs/agents/` live at the workspace root.

## Working with apps

- Run an app locally: `npm run dev -w apps/<name>` (from the workspace root), or `npm run dev` from inside the app directory.
- Build one app: `npm run build -w apps/<name>`.
- Upload one app: `npm run upload -w apps/<name>`.
- Build, typecheck, or lint the whole workspace from the root: `npm run build`, `npm run typecheck`, `npm run lint`.
- Each app owns its unique `apps.identifier` in `apps/<name>/vite.config.ts` — never share or copy it between apps.

## Shipping changes

Changes reach users by merge, not by manual upload: open a pull request, get it reviewed and merged into the default branch, and `.github/workflows/deploy-datadog-apps.yml` uploads only the `apps/<name>` folders that changed. The app updates live in App Builder — that's where the change should be verified, not just locally.

This workspace's generated CI (a custom per-app matrix job authenticated with long-lived `DATADOG_API_KEY`/`DATADOG_APP_KEY` repository secrets) is authoritative here. Do not add `DataDog/apps-github-action` or wire up `dd-sts`-minted credentials — that pattern applies to other Datadog Apps repos, not to workspaces this tool generates. See `docs/agents/cicd.md` for the full workflow behavior.

## Testing

- Storybook stories are not required for apps in this workspace right now — skip them unless explicitly asked.
- Playwright is still encouraged for browser validation when available, especially for visual/design changes.
- Validate with `npm run dev`, `npm run build`, and `npm run typecheck`/`npm run lint`; treat the post-merge deploy and a manual check in App Builder as the real verification step.

## Adding another app

Before scaffolding a new app, sync your branch with the repository's dynamically resolved default branch to avoid stale lockfile entries. If the detected default branch is `master`, run `git fetch origin master && git merge --no-ff origin/master`; substitute the detected branch name when it is not `master`. This ensures `npm install` runs against the current workspace state rather than a stale snapshot that may include deleted apps.

Run `npm init @datadog/apps` (or `npm init @datadog/apps --app <name>`) from inside this workspace. It auto-detects the workspace root, scaffolds `apps/<name>/`, and installs dependencies once at the root — no need to run `npm install` again per app.

**Agent-created apps:** When a user asks the agent to add an app to this workspace, run `npm init @datadog/apps --app <name>` from the workspace root. If the `npm init` wrapper cannot pass arguments, run `npx --yes @datadog/create-apps --app <name> --template vite-react --yes` from that same root, without a positional directory. The generated `apps/<name>/package.json` must satisfy the React alignment rule in **Managing dependencies** before the root install and lockfile gate; CI is the final authority.

This is an npm workspace when the root `package.json` has a `workspaces` field and the root contains `package-lock.json`. After adding, removing, or renaming a workspace, the root lockfile must contain both its `apps/<directory>` or `packages/<directory>` package record and its `node_modules/<package-name>` workspace link.

### Required lockfile gate before opening or updating a PR

The root `package-lock.json` is generated output shared by every app and package. Never edit or splice it by hand, resolve its conflicts line by line, or delete the entire lockfile to resolve a conflict.

After making all workspace changes, complete this procedure before opening or updating a pull request:

1. Fetch `origin`, dynamically resolve the repository's actual default branch, and incorporate its latest commit. Do not assume the branch is named `main` or `master`. Record the incorporated default-branch SHA.
2. Keep every app and package directory from the combined tree. If `package-lock.json` conflicts or cannot be parsed, restore the lockfile from that latest default-branch commit; do not discard either side's workspace directories.
3. From the workspace root, regenerate only the lockfile:

   ```sh
   npm install --package-lock-only --ignore-scripts
   ```

4. From the workspace root, perform a clean validation:

   ```sh
   npm ci --ignore-scripts
   ```

5. Confirm every new workspace has both its `apps/<directory>` or `packages/<directory>` record and its `node_modules/<package-name>` workspace link in the root lockfile.
6. Commit the app or package files and root `package-lock.json` together. If lockfile generation or `npm ci` fails, do not commit, open or update the pull request, upload, or merge.

Before requesting a merge, fetch the default branch again. If its SHA changed after step 1, repeat the reconciliation, regeneration, and validation against the new commit. Never request or perform the merge until the latest validation and the pull request's `npm ci` check have both completed successfully. Do not run upload or build commands as part of this lockfile gate.

## Managing dependencies

Declare each dependency in the workspace that imports it, even when npm physically hoists it into the root `node_modules`:

- App runtime dependency: `npm install <dependency> -w apps/<name>`.
- Shared-package runtime dependency: `npm install <dependency> -w packages/<name>`.
- Root build tooling: run `npm install --save-dev <dependency>` from the workspace root without a workspace flag.
- Host-owned singletons such as React belong in a shared package's `peerDependencies`; apps that import React still declare it directly.
- React alignment: before installing dependencies for a workspace app, inspect its `package.json` and the root `package.json`. The app's `react` and `react-dom` ranges must match the root `overrides`; if React types are declared, they must match the root `devDependencies`. The `@datadog/druids` peer range is a compatibility check, not a workspace version selector; validate every workspace app resolves one React / React DOM version.

Run `npm install` and `npm ci` only from the workspace root. Commit the single root `package-lock.json`; do not create per-app lockfiles or maintain app-level `node_modules` directories. npm's default hoisted strategy shares compatible versions at the root and may create nested copies only when versions conflict, so code must never rely on a dependency's physical install location.

After changing any `package.json`, follow the required lockfile gate above and commit the updated root lockfile in the same change.

## Sharing code between apps

Shared libraries live under `packages/<name>/` and are linked into apps through npm workspaces: depend on them with the `"*"` version range and npm resolves them from the local workspace, not the registry. (npm does not implement the `workspace:*` protocol that Yarn/pnpm use — use `"*"`.) Dev tooling (TypeScript, Vite, ESLint) is hoisted to the root, so a shared package needs no build step or toolchain of its own — Vite bundles its source directly.

Scaffold one with the CLI (recommended):

```sh
npm init @datadog/apps --package shared
```

This creates `packages/shared/` with a scoped `@bits-e2e-apps-v2/shared` package name, an `exports` map pointing at raw `src/index.ts` source, and a `tsconfig.json` that extends the root `tsconfig.base.json`. To wire it into an app:

1. Depend on it from the app (`apps/<name>/package.json`):

   ```json
   "dependencies": { "@bits-e2e-apps-v2/shared": "*" }
   ```

2. Run `npm install` once at the workspace root to link it.

3. Import it in the app like any other package:

   ```ts
   import { greet } from '@bits-e2e-apps-v2/shared';
   ```

If an app's `npm run typecheck` cannot resolve the shared package's types, add a `paths` entry to the app's `tsconfig.json` (or a TS project reference) pointing at the package source relative to the app directory (e.g. `../../packages/shared/src`). Runtime bundling via Vite works without this.

## Auth

Apps use OAuth by default for local development and uploads. Set `DD_API_KEY` and `DD_APP_KEY` in your environment to use API-key based auth instead.

## Publishing this workspace to a source code provider

When the user asks to "publish", "push up", or "create a repo" for this workspace:

1. Check whether an `origin` remote already exists.
2. If `origin` exists, show its URL and push the current branch. Never replace it without explicit approval.
3. If no remote exists and the user wants GitHub, confirm the target `OWNER/REPO`, then run `gh repo create OWNER/REPO --private --source=. --remote=origin --push` from this workspace root.
4. Use the workspace directory name as the repository name only when the user has not specified one. Default new repositories to private.
5. Confirm before creating any remote repository because it changes external state. Never force-push or change repository visibility unless explicitly requested.
6. If the provider CLI is missing or unauthenticated, preserve the local repository and give the user the manual command.
7. After publishing, remind the user to grant the Datadog GitHub or GitLab integration access before using the repository with Bits Code.

Bits Code supports both GitHub.com and GitLab.com. GitHub can be published with `gh` as described above. Do not assume the same command or authentication flow for GitLab; follow the configured GitLab source code integration and use its provider-specific tooling.

## Read relevant guides

- Embedded app context / routing / storage: `docs/agents/runtime-context.md`
- Backend functions (`*.backend.ts`): `docs/agents/backend-functions.md`
- Local dev / auth / build / upload: `docs/agents/build-upload-auth.md`
- CI/CD (GitHub Actions deploy workflow): `docs/agents/cicd.md`
- Data access (DDSQL vs. Action Catalog, Connections, datastores): `docs/agents/data.md`
- Triggering or polling Workflow Automation from a backend function: `docs/agents/workflow-automation.md`
- Upgrading `@datadog/vite-plugin` or `@datadog/action-catalog`: `docs/agents/upgrading.md`
