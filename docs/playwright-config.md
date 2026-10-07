# Playwright Config

Playwright config is in `playwright.config.ts`.

## Main Settings

| Setting | Value | Meaning |
| --- | --- | --- |
| `testDir` | `./tests` | Playwright looks for tests in the `tests` folder. |
| `timeout` | `env.timeout` | Test timeout comes from the selected environment config. |
| `metadata.baseApiURL` | `env.baseApiURL` | API base URL comes from the selected environment config. |
| `fullyParallel` | `true` | Tests can run in parallel. |
| `forbidOnly` | `!!process.env.CI` | CI fails if `test.only` is used. |
| `retries` | `process.env.CI ? 2 : env.retries` | CI uses two retries. Local runs use retries from the selected environment config. |
| `workers` | `process.env.CI ? 1 : undefined` | CI uses one worker. Local runs can use default workers. |
| `reporter` | `html` | Playwright creates an HTML report. |
| `use.baseURL` | `env.baseURL` | UI base URL comes from the selected environment config. |
| `projects` | `env.projects` | Browser projects come from the selected environment config. |
| `trace` | `on-first-retry` | Trace is saved on first retry. |

## Base URLs

The project has two base URLs:

- `env.baseURL` is for UI tests.
- `env.baseApiURL` is for API tests.

Playwright uses `use.baseURL` for UI actions like `page.goto("/")`.

The API URL is stored in `metadata.baseApiURL`, so API helpers and tests can read it from the Playwright config when needed.

## Browser Projects

The project chooses browser projects from the selected environment.

| Environment | Browser projects |
| --- | --- |
| `dev` | Chromium |
| `stage` | Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari |
| `prod` | Chromium, WebKit, Mobile Chrome, Mobile Safari |

## Optional Settings

The config also has commented examples for:

- `.env` file support with `dotenv`
- mobile browsers
- branded browsers
- local web server before tests

