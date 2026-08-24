import { datadogVitePlugin } from '@datadog/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import rootManifest from '../../package.json';
import { version } from './package.json';

const hasDatadogApiKeys = Boolean(
    (process.env.DD_API_KEY || process.env.DATADOG_API_KEY) &&
        (process.env.DD_APP_KEY || process.env.DATADOG_APP_KEY),
);
const datadogSite =
    process.env.DD_SITE || process.env.DATADOG_SITE || rootManifest.datadogApps?.site || 'datadoghq.com';

process.env.DD_SITE = datadogSite;
process.env.DATADOG_SITE = datadogSite;

export default defineConfig({
    base: './',
    build: {
        sourcemap: true,
    },
    plugins: [
        react(),
        datadogVitePlugin({
            logLevel: 'debug',
            auth: {
                site: datadogSite,
                apiKey: process.env.DD_API_KEY,
                appKey: process.env.DD_APP_KEY,
            },
            apps: {
                enable: true,
                authOverrides: {
                    method: hasDatadogApiKeys ? 'apiKey' : 'oauth',
                },
                identifier: '24363dab-d199-427b-9d74-8880fd754928',
                name: "Sarah's App",
                description: 'Displays alexander in red.',
            },
            errorTracking: {
                enable: hasDatadogApiKeys,
                sourcemaps: {
                    minifiedPathPrefix: '/',
                    releaseVersion: version,
                    service: "Sarah's App",
                },
            },
            metadata: {
                name: "Sarah's App",
            },
            metrics: {
                enable: hasDatadogApiKeys,
            },
        }),
    ],
});
