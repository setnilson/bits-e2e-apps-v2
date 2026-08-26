import '@datadog/druids/styles.css';

import { DruidsEnvironment } from '@datadog/druids/layout/DruidsEnvironment';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const queryClient = new QueryClient();
const appRoot = document.getElementById('app');
if (appRoot) {
    createRoot(appRoot).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <DruidsEnvironment backgroundColor="standard">
                    <App />
                </DruidsEnvironment>
            </QueryClientProvider>
        </StrictMode>,
    );
} else {
    console.error('Missing #app div for createRoot.');
}
