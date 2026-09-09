import { Button } from '@datadog/druids/form/Button';
import { TextArea } from '@datadog/druids/form/TextArea';
import { Grid } from '@datadog/druids/layout/Grid';
import { GridItem } from '@datadog/druids/layout/GridItem';
import { Spacing } from '@datadog/druids/layout/Spacing';
import { MessageBox } from '@datadog/druids/misc/MessageBox';
import { Text } from '@datadog/druids/typography/Text';
import { useMutation } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';

import { submitPrompt } from './openai.backend';

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'The request could not be completed. Try again.';
}

function App() {
    const [prompt, setPrompt] = useState('');
    const promptMutation = useMutation({
        mutationFn: () => submitPrompt(prompt),
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!prompt.trim()) {
            return;
        }
        promptMutation.mutate();
    };

    return (
        <Spacing as="main" padding="lg">
            <Grid
                columns={1}
                gap="lg"
                isFullWidth
                style={{ maxWidth: 840, margin: '0 auto' }}
            >
                <GridItem>
                    <Text as="h1" size="xl" weight="bold" marginBottom="sm">
                        Ask OpenAI
                    </Text>
                    <Text as="p" size="md" variant="secondary">
                        Send a prompt from Datadog and view the generated response.
                        Requests run through a Datadog backend function, so your
                        OpenAI credential stays in its HTTP connection.
                    </Text>
                </GridItem>

                <GridItem>
                    <MessageBox title="One-time setup" level="default">
                        Create a Datadog HTTP connection for api.openai.com with an
                        Authorization header set to Bearer plus your OpenAI API key,
                        then set its ID in openai.backend.ts before uploading the
                        app. The credential stays in the connection.
                    </MessageBox>
                </GridItem>

                <GridItem>
                    <form onSubmit={handleSubmit}>
                        <Grid columns={1} gap="md" isFullWidth>
                            <GridItem>
                                <label htmlFor="prompt">
                                    <Text
                                        as="span"
                                        size="sm"
                                        weight="bold"
                                        marginBottom="xs"
                                    >
                                        Prompt
                                    </Text>
                                </label>
                                <TextArea
                                    id="prompt"
                                    name="prompt"
                                    placeholder="What would you like OpenAI to help with?"
                                    value={prompt}
                                    onChange={(event) =>
                                        setPrompt(event.currentTarget.value)
                                    }
                                    defaultRows={8}
                                    maxRows={16}
                                    maxLength={8000}
                                    isFullWidth
                                    isDisabled={promptMutation.isPending}
                                />
                                <Text
                                    as="p"
                                    size="sm"
                                    variant="secondary"
                                    align="right"
                                    marginTop="xs"
                                >
                                    {prompt.length.toLocaleString()} / 8,000
                                </Text>
                            </GridItem>

                            <GridItem>
                                <Button
                                    type="submit"
                                    label="Submit prompt"
                                    isPrimary
                                    isLoading={promptMutation.isPending}
                                    isDisabled={!prompt.trim()}
                                />
                            </GridItem>
                        </Grid>
                    </form>
                </GridItem>

                {promptMutation.isError ? (
                    <GridItem>
                        <MessageBox title="Request failed" level="danger">
                            {getErrorMessage(promptMutation.error)}
                        </MessageBox>
                    </GridItem>
                ) : null}

                {promptMutation.data ? (
                    <GridItem>
                        <MessageBox title="OpenAI response" level="success">
                            <Text
                                as="p"
                                whiteSpace="pre-wrap"
                                overflowWrap="anywhere"
                            >
                                {promptMutation.data.text}
                            </Text>
                            <Text
                                as="p"
                                size="sm"
                                variant="secondary"
                                marginTop="md"
                            >
                                Model: {promptMutation.data.model}
                            </Text>
                        </MessageBox>
                    </GridItem>
                ) : null}
            </Grid>
        </Spacing>
    );
}

export default App;
