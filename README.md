# Playwright Modern Project Template

This TypeScript and Playwright project demonstrates the architecture of a test framework: typed API clients, Playwright fixtures, shared request helpers, test data generation, and environment configuration.

The implemented API and UI tests target Practice Software Testing. Visual, accessibility, and performance folders are available for extending the framework.

## What Is Inside

- Seven API smoke tests and seven API regression tests for users, products, and categories
- Seven UI smoke tests and eight UI regression tests for authentication, catalog, product details, and cart
- A dedicated `api` Playwright project that does not request browser fixtures
- Typed API clients provided through worker-scoped fixtures
- API, user, browser, page-object, and product-data fixtures with automatic resource cleanup
- Faker request generators and shared API logging with Pino
- Cached admin authentication and user-specific tokens for browser storage state
- Environment configurations for dev, stage, and prod, with browser and headless overrides
- Screenshots and traces attached to the HTML report for failed UI tests
- Page objects with a shared header component, plus visual, accessibility, and performance placeholders

## UI Coverage

The UI suites contain seven smoke cases and eight regression cases before browser projects are expanded:

| Spec filename in each UI suite | Smoke coverage | Regression coverage |
| --- | --- | --- |
| `loginFlow.spec.ts` | 2: sign-in with account-page checks, and sign-out with protected-page checks. | 2: incorrect password, and password recovery followed by sign-in. |
| `productFlow.spec.ts` | 2: exact-name product search, and navigation from the catalog to product details. | 2: no search results, and restoring the catalog by resetting search. |
| `productDetailFlow.spec.ts` | 1: product name, price, and default quantity. | 2: minimum quantity, and increasing/decreasing quantity. |
| `cartFlow.spec.ts` | 2: adding a product with quantity/price/total checks, and cash-on-delivery payment validation. | 2: multiple units and their total, and removing two products with total recalculation and an empty-cart check. |

The catalog, product-detail, and cart specs add eleven cases to the four login-flow cases. The removal case checks both removing one of two positions and removing the final position. Its initial checks also verify the total for two different products.

Payment validation checks the success message after the first payment check. Final order confirmation and invoice creation are outside this case.

## Test Data

Tests create their own users, products, or categories when needed. Product tests reuse category, brand, and image references from an existing product to keep this architecture example simple. These related records could instead be prepared before each test. The selected API environment must contain a product with valid references.

API suites live in `tests/api/smoke/` and `tests/api/regression/`. UI suites live in `tests/ui/smoke/` and `tests/ui/regression/`.

UI inventory tests use `fixtures/productFixture.ts`: `productCount` defaults to `1`, `products` contains all prepared products, and `product` exposes the first item. Set `test.use({ productCount: 2 })` in the describe group that needs two products. Teardown deletes the current cart through `cartsApi` before deleting the prepared products. See [UI Product Data](./docs/fixtures.md#ui-product-data) and [Carts API](./docs/carts-api.md).

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
