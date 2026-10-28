# CI

CI config is in `.github/workflows/playwright.yml`. The workflow is active.

## When It Runs

The workflow runs on:

- push to `main` or `master`
- pull request targeting `main` or `master`

## What It Does

1. Checks out the repository.
2. Sets up Node.js with the latest LTS version.
3. Installs dependencies with `npm ci`.
4. Installs Playwright browsers and system dependencies.
5. Runs `npx playwright test` using the environment resolved by the config.
6. Uploads the Playwright HTML report unless the job is cancelled.

## Artifact

The uploaded artifact is named `playwright-report` and is retained for 30 days. It contains `playwright-report/`, including attachments copied into the HTML report.

Failed UI tests save screenshots when a page is available and retain traces, including on the first attempt with no retries. Failures before browser or page creation may have no browser artifacts. API-only tests do not produce browser screenshots.

Download and extract the artifact, then open it locally:

```bash
npx playwright show-report path/to/extracted/report
```

Attachments are available on the failed test's page in the report. Changing recording settings affects future runs only.

## Environment Variables

The workflow invokes Playwright directly; it does not currently declare an `env:` block or integrate with a secrets manager. The config reads process variables and the optional root `.env`, which is currently tracked by Git.

| Variable | Behavior |
| --- | --- |
| `TEST_ENV` | Selects `dev`, `stage`, or `prod`; defaults to `dev` if unset or empty. Use `prod` for the public demo UI. |
| `TEST_BROWSER` | Selects one browser locally or in CI. Missing, empty, or whitespace-only uses the selected environment's default browser list. |
| `HEADLESS` | Used locally; a non-empty `CI` forces headless mode even when `HEADLESS=false`. |
| `API_ADMIN_EMAIL`, `API_ADMIN_PASSWORD` | Existing admin credentials needed by API clients and UI test-user setup and cleanup. |

GitHub Actions supplies `CI=true`. The current workflow uses one worker and environment-defined retries. Browser selection does not remove the dedicated `api` project.

For example, a test-step `env:` block can select prod and Firefox:

```yaml
env:
  TEST_ENV: prod
  TEST_BROWSER: firefox
```

Omit `TEST_BROWSER` or set it to an empty string to use the environment's default list. If a root `.env` defines it, that value is loaded when the process variable is absent; set it explicitly to an empty string to override a file value.

A `.env` file is not required in CI. Existing process variables take precedence over the file. Supply private credentials through GitHub Actions secrets or another secrets manager rather than committing them. See [Environment Config](./environment-config.md#current-environment) and [Commands](./commands.md).
