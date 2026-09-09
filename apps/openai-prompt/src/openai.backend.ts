import { request } from '@datadog/action-catalog/http/http';

const MODEL = 'gpt-5.4-mini';
const MAX_PROMPT_LENGTH = 8_000;
// Replace this value with the ID of a Datadog HTTP connection that adds
// `Authorization: Bearer <OPENAI_API_KEY>` to requests for api.openai.com.
const OPENAI_HTTP_CONNECTION_ID = 'replace-with-openai-http-connection-id';

type OpenAIContent = {
    type?: string;
    text?: string;
};

type OpenAIOutput = {
    type?: string;
    content?: OpenAIContent[];
};

type OpenAIResponse = {
    id?: string;
    model?: string;
    output?: OpenAIOutput[];
};

export type PromptResult = {
    responseId?: string;
    model: string;
    text: string;
};

function readOutputText(body: OpenAIResponse): string {
    return (body.output ?? [])
        .flatMap((item) => item.content ?? [])
        .filter((content) => content.type === 'output_text')
        .map((content) => content.text ?? '')
        .join('\n')
        .trim();
}

export async function submitPrompt(prompt: string): Promise<PromptResult> {
    const cleanPrompt = prompt.trim();

    if (!cleanPrompt || cleanPrompt.length > MAX_PROMPT_LENGTH) {
        throw new Error('Enter a prompt between 1 and 8,000 characters.');
    }

    if (OPENAI_HTTP_CONNECTION_ID.startsWith('replace-with-')) {
        throw new Error(
            'Configure the OpenAI HTTP connection ID before using this app.',
        );
    }

    const response = await request({
        connectionId: OPENAI_HTTP_CONNECTION_ID,
        inputs: {
            verb: 'POST',
            url: 'https://api.openai.com/v1/responses',
            requestHeaders: [
                {
                    key: 'Content-Type',
                    value: ['application/json'],
                },
            ],
            body: {
                model: MODEL,
                input: cleanPrompt,
            },
            responseParsing: 'json',
            errorOnStatus: ['400-599'],
        },
    });

    const body = response.body as OpenAIResponse;
    const text = readOutputText(body);

    if (!text) {
        throw new Error('OpenAI returned a response without text output.');
    }

    return {
        responseId: body.id,
        model: body.model ?? MODEL,
        text,
    };
}
