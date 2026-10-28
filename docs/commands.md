# Commands

Commands are defined in `package.json`.

## Test Commands

| Command | Selection |
| --- | --- |
| `npm test` | All tests using the environment and browser selection resolved by the config. |
| `npm run test:dev` | Sets `TEST_ENV=dev`. |
| `npm run test:stage` | Sets `TEST_ENV=stage`. |
| `npm run test:prod` | Sets `TEST_ENV=prod`. |

The environment scripts use POSIX shell syntax. In PowerShell, set `TEST_ENV` separately and run `npm test`.

Set `TEST_ENV`, `TEST_BROWSER`, and `HEADLESS` in the optional root `.env` or through your shell. Forward Playwright arguments after `--`:

```bash
npm test -- tests/ui
npm test -- tests/api --project=api
npm test -- --list --reporter=list
```

Dev and stage UI URLs are illustrative placeholders. Select `prod` for the public demo UI.

## UI Tests

Install browser binaries before running UI tests:

```bash
npx playwright install
```

Set `TEST_ENV=prod` in `.env` or your shell, then run either login-flow suite:

```bash
npm test -- tests/ui/smoke
npm test -- tests/ui/regression
```

Smoke tests cover sign-in, the account page, and sign-out. Regression tests cover an incorrect password and password recovery followed by sign-in. Each test creates its own user through the API and deletes it during teardown, so admin API credentials are required.

Check discovery without launching browsers or sending API requests:

```bash
npm test -- tests/ui --list --reporter=list
```

These commands respect `TEST_BROWSER`. If it is empty or unset, all browser projects configured for prod are used.

## API Smoke Tests

Run the API smoke suite:

```bash
npx playwright test tests/api/smoke --project=api
```

Run only the user API spec:

```bash
npx playwright test tests/api/smoke/adminUserApi.spec.ts --project=api
```

Run only the product API spec:

```bash
npx playwright test tests/api/smoke/adminProducts.spec.ts --project=api
```

The product spec covers creation and retrieval by ID. It requires admin credentials and existing catalog data for category, brand, and image references. Each test creates a separate product; `afterAll({ productsApi })` deletes the recorded products with `Promise.all`. The shared API fixture disposes the request context at worker teardown.

Run only the category API spec:

```bash
npx playwright test tests/api/smoke/adminCategory.spec.ts --project=api
```

The category spec covers creation and retrieval by ID. Each test creates its own root category; `afterAll({ categoryApi })` deletes the recorded categories, and the shared API fixture disposes the request context at worker teardown. Admin credentials are required for cleanup.

Check test discovery and imports without sending API requests:

```bash
npx playwright test --project=api --list --reporter=list
```

The user API smoke spec contains three cases: registration, email update, and deletion. Each creates its own user. Set `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD` to an admin account: update and deletion need it, and registration also deletes its test data during teardown. `afterAll` receives `userApi` from the shared fixture and deletes IDs recorded by the registration and update tests. The deletion case removes its own user within the test. The API fixture disposes the request context at worker teardown; see [Test Fixtures](./fixtures.md).

## API Regression Tests

Run the admin API regression suite:

```bash
npx playwright test tests/api/regression --project=api
```

The suite contains seven cases:

- Users: registration with whitespace-only email and password, email exceeding 256 characters
  during update, and searching for a deleted user.
- Products: creation with an empty name and retrieval after deletion.
- Categories: creation with an empty name and retrieval after deletion.

Admin credentials are required. Product tests reuse existing category,
brand, and image references. Each scenario that requires a new resource
creates its own test data.

The registration case sends one space in each of `email` and `password` and expects a rejection with status 422. It checks the combined invalid payload, not each field independently. Error cases use `.rejects.toThrow()` with the request method, URL, and expected status because API clients throw on unsuccessful HTTP responses.

The user update case records its created user for cleanup in `afterAll`. The deleted-user search case removes its user within the test. Product and category retrieval cases create and delete their own resource before expecting 404; their cleanup sets remove IDs after successful deletion. Negative creation cases do not track a resource because creation is expected to fail.

## Environment Variables

The config reads `TEST_ENV`, `TEST_BROWSER`, and `HEADLESS` from the process environment and optional root `.env`. Shell or CI variables take precedence over `.env`.

For example:

```dotenv
TEST_ENV=prod
TEST_BROWSER=chromium
HEADLESS=true
```

Then run `npm test`, `npm test -- tests/ui`, or `npm test -- tests/api --project=api`.

A missing, empty, or whitespace-only `TEST_BROWSER` uses the selected environment's configured browser list. An invalid browser name fails configuration loading. This behavior is the same locally and in CI; the API project remains separate.

PowerShell overrides:

```powershell
$env:TEST_ENV = "prod"
$env:TEST_BROWSER = "firefox"
$env:HEADLESS = "true"
npm test -- tests/ui
```

To remove these shell overrides and use the file's values again:

```powershell
Remove-Item Env:TEST_ENV, Env:TEST_BROWSER, Env:HEADLESS -ErrorAction SilentlyContinue
```

API requests also require `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD`, supplied through process variables or the optional file. See [Environment Config](./environment-config.md#current-environment) for loading behavior and secrets storage.

## Reports

Failed UI tests save screenshots when a page is available and retain traces, even without retries. These attachments appear in the HTML report and in the report uploaded by CI.

```bash
npx playwright show-report
```

See [Failure Artifacts](./playwright-config.md#failure-artifacts) and [CI](./ci.md#artifact).

