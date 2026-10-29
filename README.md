# Playwright Modern Project Template

This TypeScript and Playwright project demonstrates the architecture of a test framework: typed API clients, Playwright fixtures, shared request helpers, test data generation, and environment configuration.

The implemented API and UI tests target Practice Software Testing. Visual, accessibility, and performance folders are available for extending the framework.

## What Is Inside

- Seven API smoke tests and seven API regression tests for users, products, and categories
- Two UI smoke tests and two UI regression tests for sign-in, sign-out, and password recovery
- A dedicated `api` Playwright project that does not request browser fixtures
- Typed API clients provided through worker-scoped fixtures
- Separate API, user, and browser fixtures with automatic test-user cleanup
- Faker request generators and shared API logging with Pino
- Cached admin authentication and user-specific tokens for browser storage state
- Environment configurations for dev, stage, and prod, with browser and headless overrides
- Screenshots and traces attached to the HTML report for failed UI tests
- Page objects with a shared header component, plus visual, accessibility, and performance placeholders

## Test Data

Tests create their own users, products, or categories when needed. Product tests reuse category, brand, and image references from an existing product to keep this architecture example simple. These related records could instead be prepared before each test. The selected API environment must contain a product with valid references.

API suites live in `tests/api/smoke/` and `tests/api/regression/`. Login-flow UI suites live in `tests/ui/smoke/` and `tests/ui/regression/`.

## Run API Tests

Install dependencies:

```bash
npm ci
```

Supply `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD` for an existing admin account through process environment variables or the optional root `.env` file. The root `.env` is currently tracked by Git; keep private credentials in process variables or a secrets manager. See [Environment Config](./docs/environment-config.md#current-environment).

After [starting the local Docker application](./docs/commands.md#local-docker-setup), select dev in PowerShell and check test discovery:

```powershell
$env:TEST_ENV = "dev"
npx playwright test --project=api --list --reporter=list
```

Run either suite:

```bash
npx playwright test tests/api/smoke --project=api
npx playwright test tests/api/regression --project=api
```

Listing tests sends no API requests. Running the suites creates and deletes test data. API-only tests do not require installed browsers. UI tests require browser binaries; install them with `npx playwright install`.

Dev uses the Docker application at `http://localhost:4200` and its API at `http://localhost:8091`. The stage UI URL is a placeholder; prod uses the public site.

CI uses Docker because Cloudflare served security-verification pages instead of the application UI to GitHub Actions. See [CI](./docs/ci.md#why-docker).

## Run UI Tests

For local runs, follow [Local Docker Setup](./docs/commands.md#local-docker-setup) to fetch the application, start its containers, initialize the database, and configure seed credentials. Then set these values in `.env` or your shell:

```dotenv
TEST_ENV=dev
TEST_BROWSER=chromium
HEADLESS=true
```

Run the UI suites:

```bash
npm test -- tests/ui
```

Set `TEST_ENV`, `TEST_BROWSER`, and `HEADLESS` through `.env` or your shell. Empty `TEST_BROWSER` uses the selected environment's configured browser list; the same rule applies in CI. CI runs browsers in headless mode. Set the repository variable `TEST_BROWSER` to select one browser in CI; an empty value uses all dev browser projects.

Check discovery without launching browsers:

```bash
npm test -- tests/ui --list --reporter=list
```

Failed UI tests retain traces and save screenshots when a page is available. Open the HTML report with `npx playwright show-report`, or download the `playwright-report` artifact from CI. See [Commands](./docs/commands.md) for all scripts and [Failure Artifacts](./docs/playwright-config.md#failure-artifacts) for recording behavior.

## Documentation

More project documentation is in the [docs](./docs/README.md) folder.
