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
| `retries` | `env.retries` | Both CI and local runs use retries from the selected environment config. |
| `workers` | `process.env.CI ? 1 : undefined` | CI uses one worker. Local runs can use default workers. |
| `reporter` | `html` | Playwright creates an HTML report. |
| `use.baseURL` | `env.baseURL` | UI base URL comes from the selected environment config. |
| Browser project `use.headless` | `env.headless` | Controls browser windows; `HEADLESS` overrides the selected environment's default. |
| `projects` | `api` plus `env.projects` | API tests run in one dedicated project; browser projects come from the selected environment config. |
| `trace` | `on-first-retry` | Trace is saved on first retry. |

## Base URLs

The project has two base URLs:

- `env.baseURL` is for UI tests.
- `env.baseApiURL` is for API tests.

Playwright uses `use.baseURL` for UI actions like `page.goto("/")`.

The API URL is stored in `metadata.baseApiURL`, so API helpers and tests can read it from the Playwright config when needed.

## Browser Projects

The project chooses browser projects from the selected environment.

Each entry in `availableProjects` sets `headless` after its device preset:

```ts
use: { ...devices['Desktop Chrome'], headless: env.headless },
```

The same setting applies to Firefox, WebKit, and both mobile browser projects. `getEnvironment()` resolves `HEADLESS` from the process environment or optional `.env`, falling back to the selected config when it is missing or empty. See [Headless Mode](./environment-config.md#headless-mode).

The `api` project uses `testDir: './tests/api'` and `use.baseURL: env.baseApiURL`. Browser projects exclude that folder with `testIgnore: '**/tests/api/**'`, so API tests are not repeated for each browser. Other test folders remain included in browser projects.

| Environment | Browser projects |
| --- | --- |
| `dev` | Chromium |
| `stage` | Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari |
| `prod` | Chromium, WebKit, Mobile Chrome, Mobile Safari |

## Optional Settings

The config includes a commented example for starting a local web server before tests.

The optional root `.env` is loaded by `config/env.ts` using Node.js `loadEnvFile()` before `getEnvironment()` selects the configuration. No `dotenv` dependency is used. See [Environment Config](./environment-config.md#current-environment).

