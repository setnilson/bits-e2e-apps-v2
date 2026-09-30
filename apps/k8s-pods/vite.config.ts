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

// The Datadog plugin reads DATADOG_SITE/DD_SITE from the environment itself
// and rejects an empty string as an invalid site. Unset empty values so it
// falls back to the site configured below.
for (const key of ['DATADOG_SITE', 'DD_SITE']) {
    if (process.env[key] === '') {
        delete process.env[key];
    }
}

export default defineConfig({
    base: './',
    // npm resolves the `^18 || ^19` peer ranges of @datadog/apps-frontend to a
    // nested react@19 copy for this app, which would create two React
    // instances in the bundle and crash hooks. Force every react import to
    // resolve to the workspace's single React install.
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    build: {
        sourcemap: true,
    },
    plugins: [
        react(),
        datadogVitePlugin({
            logLevel: 'debug',
            auth: {
                site: process.env.DD_SITE || rootManifest.datadogApps?.site || datadogAppConfig.datadogSite,
                apiKey: process.env.DD_API_KEY,
                appKey: process.env.DD_APP_KEY,
            },
            apps: {
                enable: true,
                // `id` is this app's permanent identity — do NOT change it,
                // and do NOT set it to the app's UUID from App Builder.
                identifier: datadogAppConfig.id,
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

