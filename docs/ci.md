# CI

CI config is in `.github/workflows/playwright.yml`.

The file is currently fully commented out, so this workflow is inactive. The sections below describe the example that can be enabled.

## When It Runs

When enabled, the example workflow runs on:

- push to `main` or `master`
- pull request to `main` or `master`

## What It Does

The example workflow:

1. Checks out the repository.
2. Sets up Node.js with the latest LTS version.
3. Installs dependencies with `npm ci`.
4. Installs Playwright browsers.
5. Runs Playwright tests.
6. Uploads the Playwright HTML report as an artifact.

## Artifact

The uploaded artifact is named `playwright-report`.

It is stored for 30 days.

## Environment Variables

Before enabling API tests in CI, supply `TEST_ENV`, `API_EMAIL`, and `API_PASSWORD` to the test process. The example workflow does not currently configure these values or integrate with a secrets manager.

Prefer resolving environment-specific secret references from Vault or another secrets manager in CI and injecting the values as process environment variables. The framework reads the resulting values from `process.env`; it does not resolve secret references itself.

A `.env` file is not required in CI and is excluded from Git. The loader checks whether it exists before reading it, so an absent file does not cause an error. If a local file is present, existing process variables take precedence. See [Environment Config](./environment-config.md#current-environment).

