# Playwright Modern Project Template

This TypeScript and Playwright project demonstrates the architecture of a test framework: typed API clients, an object factory, shared request helpers, test data generation, and environment configuration.

The implemented tests target the Practice Software Testing API. UI, visual, accessibility, and performance folders are available for extending the framework.

## What Is Inside

- Seven API smoke tests and seven API regression tests for users, products, and categories
- A dedicated `api` Playwright project that does not request browser fixtures
- Typed API clients accessed through `ApiFactory`
- Faker request generators and shared API logging with Pino
- Cached admin authentication and user-specific tokens for browser storage state
- Environment configurations for dev, stage, and prod
- UI and page object structure, plus visual, accessibility, and performance placeholders

## Test Data

Tests create their own users, products, or categories when needed. Product tests reuse category, brand, and image references from an existing product to keep this architecture example simple. These related records could instead be prepared before each test. The selected API environment must contain a product with valid references.

Smoke tests live directly in `tests/api/smoke/`; regression tests live directly in `tests/api/regression/`.

## Run API Tests

Install dependencies:

```bash
npm ci
```

Supply `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD` for an existing admin account through the process environment or an ignored local `.env` file. See [Environment Config](./docs/environment-config.md#current-environment). Prefer a secrets manager for shared environments and CI.

In PowerShell, select the public API environment and check test discovery:

```powershell
$env:TEST_ENV = "prod"
npx playwright test --project=api --list --reporter=list
```

Run either suite:

```bash
npx playwright test tests/api/smoke --project=api
npx playwright test tests/api/regression --project=api
```

Listing tests sends no API requests. Running the suites creates and deletes test data. API-only tests do not require installed browsers. For future UI tests, install browsers with `npx playwright install`.

The prod UI URL is `https://practicesoftwaretesting.com/`. Dev and stage UI URLs are illustrative placeholders. The dev API points to `http://localhost:8091`; stage and prod currently share the public API URL.

## Documentation

More project documentation is in the [docs](./docs/README.md) folder.
