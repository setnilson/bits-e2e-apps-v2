# Runtime Context

Datadog Apps are embedded inside the Datadog UI. Treat this app as iframe-hosted browser code with Datadog-managed backend execution.

## Iframe embedding

- The app runs inside an iframe owned by the Datadog UI.
- The current App Builder iframe sandbox allows scripts, popups, popups escaping the sandbox, same-origin access, forms, and top navigation only by user activation.
- Do not assume app code can control, read, or directly navigate the parent Datadog page.
- Prefer hash-based routing for in-app routes. Avoid `BrowserRouter` and routers that depend on reliable top-level History API behavior.
- In-app links should use hash URLs such as `href="#/details"`.
- External URLs can open popups or top-level navigation only through browser-supported, user-initiated flows.
- Verify the current Datadog embedding sandbox before relying on a specific browser capability. Datadog controls the sandbox attributes and may change them.

## Storage and cookies

- Browser storage is scoped to the app's origin and is not shared with the parent Datadog UI.
- Storage can differ between standalone local development and embedded runtime because modern browsers partition storage by top-level site and iframe origin.
- Third-party cookies are unreliable for durable app state.
- For durable server-side state, use backend functions and a Datadog-supported durable storage mechanism.

## Backend call transport

Frontend code imports backend functions like normal ES modules, but those imports are rewritten by the Datadog Vite plugin. The function body does not run in the browser.

- In local dev, backend calls go through Vite middleware and Datadog preview infrastructure.
- In deployed apps, backend calls go through the Datadog iframe/runtime bridge.
- Do not build app logic that depends on backend functions running in the local Node.js process.

For backend implementation details, read `backend-functions.md`.
