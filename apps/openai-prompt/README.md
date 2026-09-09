# OpenAI Prompt

A Datadog App that submits prompts to OpenAI through a Datadog-managed backend
function.

## Configure OpenAI access

1. In Datadog, create an HTTP connection for `api.openai.com`.
2. Configure the connection to send an `Authorization` header with the value
   `Bearer <OPENAI_API_KEY>`.
3. Copy the connection ID and replace
   `replace-with-openai-http-connection-id` in `src/openai.backend.ts`.

The connection ID must be a static value so Datadog can authorize it when the
app is uploaded. The API key remains in the Datadog connection and is never
included in frontend code.
