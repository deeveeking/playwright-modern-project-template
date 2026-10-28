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
| Browser project `use.headless` | `env.headless` | `HEADLESS` overrides the environment default locally; a non-empty `CI` forces headless mode. |
| `projects` | `api` plus `env.projects` | API tests run in one dedicated project; `TEST_BROWSER` selects one browser or the environment's default browser list is used. |
| `screenshot` | `only-on-failure` | Screenshots are saved for failed UI tests when a page is available. |
| `trace` | `retain-on-failure` | Traces are retained for failed tests, including the initial attempt. |

## Base URLs

The project has two base URLs:

- `env.baseURL` is for UI tests.
- `env.baseApiURL` is for API tests.

Playwright uses `use.baseURL` for UI actions like `page.goto("/")`.

The API URL is stored in `metadata.baseApiURL`, so API helpers and tests can read it from the Playwright config when needed.

## Browser Projects

The project uses the selected environment's browser list by default. Set `TEST_BROWSER` to `chromium`, `firefox`, `webkit`, `mobile-chrome`, or `mobile-safari` to select one browser locally or in CI. A missing, empty, or whitespace-only value uses the environment's default list. The `api` project stays available separately. See [Browser Selection](./environment-config.md#browser-selection) and [Commands](./commands.md).

Each entry in `availableProjects` sets `headless` after its device preset:

```ts
use: { ...devices['Desktop Chrome'], headless: env.headless },
```

The same setting applies to Firefox, WebKit, and both mobile browser projects. A non-empty `CI` forces headless mode. Outside CI, `getEnvironment()` resolves `HEADLESS` from the process environment or optional `.env`, falling back to the selected config when it is missing or empty. See [Headless Mode](./environment-config.md#headless-mode).

The `api` project uses `testDir: './tests/api'` and `use.baseURL: env.baseApiURL`. Browser projects exclude that folder with `testIgnore: '**/tests/api/**'`, so API tests are not repeated for each browser. Other test folders remain included in browser projects.

| Environment | Browser projects (default) |
| --- | --- |
| `dev` | Chromium |
| `stage` | Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari |
| `prod` | Chromium, WebKit, Mobile Chrome, Mobile Safari |

## Failure Artifacts

Playwright attaches screenshots and traces from failed UI tests to the HTML report. Traces are retained even with `retries: 0`. A failure before a page or browser context is created may have no screenshot or trace; API-only tests do not produce browser screenshots.

The CI workflow uploads `playwright-report/`, including its attachments, as the `playwright-report` artifact. Existing reports are not changed by configuration updates. Open a new report locally with `npx playwright show-report` or download and extract the CI artifact first. See [CI Artifacts](./ci.md#artifact).

## Optional Settings

The config includes a commented example for starting a local web server before tests.

The optional root `.env` is loaded by `config/env.ts` using Node.js `loadEnvFile()` before `getEnvironment()` selects the configuration. No `dotenv` dependency is used. See [Environment Config](./environment-config.md#current-environment).

