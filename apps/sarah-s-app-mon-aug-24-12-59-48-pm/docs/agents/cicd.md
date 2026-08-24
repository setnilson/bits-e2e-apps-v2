# CI/CD

## GitHub Actions

Use `DataDog/apps-github-action` to deploy on pushes to the deployment branch. Keep `app-directory` aligned with the app's path in the repository.

```yaml
name: Continuous Deployment
on:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  deploy-app:
    name: Deploy Datadog App
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        uses: actions/setup-node@v6

      - name: Deploy
        uses: DataDog/apps-github-action@v0.0.2
        with:
          datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
          datadog-app-key: ${{ secrets.DATADOG_APP_KEY }}
          app-directory: .
```

Store `DATADOG_API_KEY` and `DATADOG_APP_KEY` as [encrypted secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) in the repository or organization settings. The application key needs both **Actions API Access** and **Apps** scopes.

For non-US1 organizations, configure the Datadog site in `vite.config.ts` and ensure CI and local config are aligned.
