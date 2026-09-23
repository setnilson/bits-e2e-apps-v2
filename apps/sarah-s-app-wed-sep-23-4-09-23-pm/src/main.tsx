import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const appRoot = document.getElementById('app');
if (appRoot) {
    createRoot(appRoot).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
} else {
    console.error('Missing #app div for createRoot.');
}
