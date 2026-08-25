import { datadogVitePlugin } from '@datadog/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import rootManifest from '../../package.json';
import { version } from './package.json';
import datadogAppConfig from './datadog-app.config.json';

const hasDatadogApiKeys = Boolean(
    (process.env.DD_API_KEY || process.env.DATADOG_API_KEY) &&
        (process.env.DD_APP_KEY || process.env.DATADOG_APP_KEY),
);
const datadogSite = process.env.DD_SITE || process.env.DATADOG_SITE || datadogAppConfig.datadogSite;

if (!process.env.DD_SITE && !process.env.DATADOG_SITE) {
    process.env.DD_SITE = datadogSite;
}

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
                site: datadogSite || rootManifest.datadogApps?.site,
                apiKey: process.env.DD_API_KEY,
                appKey: process.env.DD_APP_KEY,
            },
            apps: {
                enable: true,
                name: datadogAppConfig.name,
                description: 'A bright rainbow experience for Barak.',
                authOverrides: {
                    method: hasDatadogApiKeys ? 'apiKey' : 'oauth',
                },
                identifier: '930c642c-eb62-4cbf-acf0-fd7496aef0f8',
            },
            errorTracking: {
                enable: hasDatadogApiKeys,
                sourcemaps: {
                    minifiedPathPrefix: '/',
                    releaseVersion: version,
                    service: datadogAppConfig.name,
                },
            },
            metadata: {
                name: datadogAppConfig.name,
            },
            metrics: {
                enable: hasDatadogApiKeys,
            },
        }),
    ],
});
