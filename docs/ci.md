# CI

CI config is in `.github/workflows/playwright.yml`.

## When It Runs

The workflow runs on:

- push to `main` or `master`
- pull request to `main` or `master`

## What It Does

The workflow:

1. Checks out the repository.
2. Sets up Node.js with the latest LTS version.
3. Installs dependencies with `npm ci`.
4. Installs Playwright browsers.
5. Runs Playwright tests.
6. Uploads the Playwright HTML report as an artifact.

## Artifact

The uploaded artifact is named `playwright-report`.

It is stored for 30 days.

