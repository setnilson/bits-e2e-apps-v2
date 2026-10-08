import { DatadogAppProvider } from '@datadog/apps-frontend/embedding/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const appRoot = document.getElementById('app');
if (appRoot) {
    createRoot(appRoot).render(
        <StrictMode><DatadogAppProvider><App /></DatadogAppProvider></StrictMode>,
    );
}
