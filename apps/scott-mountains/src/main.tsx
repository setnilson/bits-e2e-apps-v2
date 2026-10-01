import '@datadog/druids/styles.css';

import { DruidsEnvironmentWithThemeInput } from '@datadog/apps-frontend/druids/react';
import { DatadogAppProvider } from '@datadog/apps-frontend/embedding/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const appRoot = document.getElementById('app');
if (appRoot) {
    createRoot(appRoot).render(
        <StrictMode>
            <DatadogAppProvider>
                <DruidsEnvironmentWithThemeInput
                    backgroundColor="standard"
                    defaultThemePreference="light"
                >
                    <App />
                </DruidsEnvironmentWithThemeInput>
            </DatadogAppProvider>
        </StrictMode>,
    );
} else {
    console.error('Missing #app div for createRoot.');
}
