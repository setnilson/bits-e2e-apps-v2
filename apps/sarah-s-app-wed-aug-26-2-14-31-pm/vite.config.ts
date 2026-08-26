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
                identifier: '733d9160-ecc5-44b5-b9dc-5b76ad34737c',
                name: datadogAppConfig.name,
                authOverrides: {
                    method: hasDatadogApiKeys ? 'apiKey' : 'oauth',
                },
            },
            errorTracking: {
                enable: hasDatadogApiKeys,
                sourcemaps: {
                    minifiedPathPrefix: '/',
                    service: datadogAppConfig.name,
                    releaseVersion: version,
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
