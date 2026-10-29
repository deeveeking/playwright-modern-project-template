# CI

CI config is in `.github/workflows/playwright.yml`. The workflow is active.

## Why Docker

Cloudflare served security-verification pages instead of the application
when UI tests accessed practicesoftwaretesting.com from GitHub Actions.
CI therefore runs the application in Docker and accesses it through
localhost:4200, with the API available on localhost:8091.

Playwright runs directly on the GitHub runner.

## When It Runs

The workflow runs on:

- push to `main` or `master`
- pull request targeting `main` or `master`

## What It Does

1. Checks out this repository, sets up the latest Node.js LTS, and installs dependencies with `npm ci`.
2. Fetches the test application's pinned `PST_APP_REF` commit into the runner's temporary directory and selects Sprint 5. Laravel uses `APP_ENV=testing` to avoid email delivery during password recovery.
3. Builds and starts the Angular UI, Laravel API, Nginx, and MariaDB containers through Docker Compose.
4. Installs the API's Composer dependencies and prepares writable Laravel directories.
5. Waits for MariaDB, then runs `php artisan migrate:fresh --seed --force` against this run's test database.
6. Waits for HTTP availability at `http://localhost:4200` and `http://localhost:8091/status`.
7. Installs Playwright browsers and system dependencies.
8. Runs `npx playwright test` with `TEST_ENV=dev`; `getEnvironment()` selects headless mode because GitHub Actions supplies `CI=true`.
9. Collects application logs and uploads report artifacts.
10. Stops the Compose project and removes its volumes using a cleanup step with `always()`.

## Artifact

The `playwright-report` artifact is retained for 30 days. It contains `playwright-report/`, including attachments copied into the HTML report, and is uploaded unless the job is cancelled.

The `docker-logs` artifact is also retained for 30 days. It contains container status, Docker Compose logs, and the Laravel log when available. Log collection and upload use `always()` so failed setup or tests can still be investigated. Logs are collected before container and volume cleanup.

Failed UI tests save screenshots when a page is available and retain traces, including on the first attempt with no retries. Failures before browser or page creation may have no browser artifacts. API-only tests do not produce browser screenshots.

Download and extract the artifact, then open it locally:

```bash
npx playwright show-report path/to/extracted/report
```

Attachments are available on the failed test's page in the report. Changing recording settings affects future runs only.

## Environment Variables

The workflow defines job-level environment variables for the local Docker application. These process variables take precedence over the optional root `.env`, which is currently tracked by Git.

| Variable | Behavior |
| --- | --- |
| `TEST_ENV` | Set to `dev` so UI and API tests target the local Docker application. |
| `TEST_BROWSER` | Read from the GitHub Actions repository variable of the same name. Empty or whitespace-only uses all projects configured in `dev`. |
| `HEADLESS` | Controls local runs. A non-empty `CI` forces headless mode, including when `HEADLESS=false`. |
| `API_ADMIN_EMAIL`, `API_ADMIN_PASSWORD` | Public seed credentials for the isolated Docker database, used by API clients and test-user setup and cleanup. |
| `SPRINT` | Set to `sprint5`. |
| `PST_APP_REF` | Pins the upstream application's source commit. |
| `COMPOSE_PROJECT_NAME` | Unique for each workflow run and attempt; scopes containers, volumes, and cleanup. |

GitHub Actions supplies `CI=true`. The current workflow uses one worker and environment-defined retries. Browser selection does not remove the dedicated `api` project.

Set the repository variable `TEST_BROWSER` to `firefox` to select Firefox. Leave it unset or empty to use the default `dev` browser list: Chromium, WebKit, Mobile Chrome, and Mobile Safari.

The workflow explicitly supplies an empty process value when the repository variable is unset, so a root `.env` browser selection does not replace the CI default.

The framework's root `.env` is not required in CI because the workflow supplies the selected environment and local seed credentials. Private credentials for other environments should come from GitHub Actions secrets or another secrets manager. See [Environment Config](./environment-config.md#current-environment) and [Commands](./commands.md).
