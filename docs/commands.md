# Commands

Commands are defined in `package.json`.

## Test Commands

```bash
npm test
```

Runs all Playwright tests.

```bash
npm run test:dev
```

Runs Playwright tests with `TEST_ENV=dev`.

```bash
npm run test:stage
```

Runs Playwright tests with `TEST_ENV=stage`.

```bash
npm run test:prod
```

Runs Playwright tests with `TEST_ENV=prod`.

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

## Environment Variable

The environment config reads `process.env.TEST_ENV`.

The `test:dev`, `test:stage`, and `test:prod` scripts set this value before running Playwright.

These three scripts use POSIX shell syntax. In PowerShell, set the variable separately:

```powershell
$env:TEST_ENV = "stage"
npx playwright test --project=api
```

To use the values from the root `.env`, run:

```powershell
npx playwright test --project=api
```

Existing shell variables override `.env`, so remove a previous override with `Remove-Item Env:TEST_ENV` if you want to use the file's `TEST_ENV` value. API requests also require `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD`, supplied through the process environment or the optional local file. See [Environment Config](./environment-config.md#current-environment) for loading behavior and secrets storage.

