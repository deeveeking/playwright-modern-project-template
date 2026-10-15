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
npx playwright test tests/api/smoke/userApi.spec.ts --project=api
```

Check test discovery and imports without sending API requests:

```bash
npx playwright test --project=api --list --reporter=list
```

The user API smoke spec contains three cases: registration, email update, and deletion. Each creates its own user. Set `API_EMAIL` and `API_PASSWORD` to an admin account: update and deletion need it, and registration also deletes its test data during teardown. `afterAll` deletes IDs recorded by the registration and update tests, then disposes the request context. The deletion case removes its own user within the test.

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

Existing shell variables override `.env`, so remove a previous override with `Remove-Item Env:TEST_ENV` if you want to use the file's `TEST_ENV` value. API requests also require `API_EMAIL` and `API_PASSWORD`, supplied through the process environment or the optional local file. See [Environment Config](./environment-config.md#current-environment) for loading behavior and secrets storage.

