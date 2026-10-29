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

Dev uses the local Docker UI and API. Start the Docker stack before running dev tests. The stage UI URL is a placeholder; prod uses the public demo.

## Local Docker Setup

The commands below use PowerShell on Windows. Install Git, Node.js 20.12 or newer, Docker Desktop with Linux containers, and a recent `curl.exe` supporting `--retry-all-errors`. Start Docker Desktop before running these commands.

Run the steps from the framework root in one PowerShell session. The application checkout lives in a sibling directory. Use a fresh directory for the first checkout; reuse it for later starts.

### Checkout the application

The commit must match `PST_APP_REF` in [the CI workflow](../.github/workflows/playwright.yml).

```powershell
$pstFrameworkDir = (Get-Location).Path
$pstAppDir = Join-Path (Split-Path -Parent $pstFrameworkDir) "practice-software-testing-dev"
$pstAppRef = "ae7caecb811dd8952c09d997e69be7cb946ecd44"

git init "$pstAppDir"
if ($LASTEXITCODE -ne 0) { throw "Application repository initialization failed." }
git -C "$pstAppDir" remote add origin https://github.com/testsmith-io/practice-software-testing.git
if ($LASTEXITCODE -ne 0) { throw "Application remote setup failed." }
git -C "$pstAppDir" fetch --depth=1 origin "$pstAppRef"
if ($LASTEXITCODE -ne 0) { throw "Application checkout fetch failed." }
git -C "$pstAppDir" checkout --detach FETCH_HEAD
if ($LASTEXITCODE -ne 0) { throw "Application checkout failed." }
```

### Configure and start the containers

Set Laravel's environment in the application's own `.env`, then select the Compose file and a dedicated local project name. `APP_ENV=testing` gives password recovery the same email behavior as CI.

```powershell
$pstApiEnvPath = Join-Path $pstAppDir "sprint5/API/.env"
$pstApiEnvLines = @(Get-Content -LiteralPath $pstApiEnvPath | Where-Object { $_ -notmatch '^APP_ENV=' })
$pstApiEnvLines += "APP_ENV=testing"
[System.IO.File]::WriteAllLines($pstApiEnvPath, $pstApiEnvLines, [System.Text.UTF8Encoding]::new($false))

$env:SPRINT = "sprint5"
$env:DISABLE_LOGGING = "true"
$env:COMPOSE_FILE = Join-Path $pstAppDir "docker-compose.yml"
$env:COMPOSE_PROJECT_NAME = "playwright-template-dev"

docker compose up -d --build mariadb laravel-api web angular-ui
if ($LASTEXITCODE -ne 0) { throw "Application containers failed to start." }

docker compose exec -T -u root -e COMPOSER_ALLOW_SUPERUSER=1 laravel-api sh -ec '
    composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader --ignore-platform-req=ext-ffi
    mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
    chown -R www-data:www-data storage bootstrap/cache
'
if ($LASTEXITCODE -ne 0) { throw "API dependency installation failed." }
```

### Initialize the test database

Wait for MariaDB before creating the schema and seed data. `migrate:fresh` resets the database belonging to this local stack; run it before tests, while no test run is active.

```powershell
$pstDatabaseReady = $false
for ($pstAttempt = 1; $pstAttempt -le 60; $pstAttempt++) {
    docker compose exec -T mariadb mysql --connect-timeout=2 --host=127.0.0.1 --user=user --password=root --database=toolshop --execute="SELECT 1" 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $pstDatabaseReady = $true
        break
    }
    Start-Sleep -Seconds 2
}
if (-not $pstDatabaseReady) { throw "MariaDB did not become ready." }

docker compose exec -T laravel-api php artisan migrate:fresh --seed --force
if ($LASTEXITCODE -ne 0) { throw "Test database initialization failed." }
```

Wait for HTTP availability after the Angular build and API dependency installation:

```powershell
foreach ($pstUrl in @("http://localhost:4200", "http://localhost:8091/status")) {
    curl.exe --fail --silent --show-error --output NUL --retry 60 --retry-delay 2 --retry-all-errors --retry-max-time 300 --connect-timeout 2 --max-time 10 "$pstUrl"
    if ($LASTEXITCODE -ne 0) { throw "Application endpoint did not become ready: $pstUrl" }
}
```

The UI is available at `http://localhost:4200`; the API is at `http://localhost:8091`. If startup fails, inspect `docker compose ps --all` and `docker compose logs --tail=100 angular-ui laravel-api web mariadb`.

### Run the tests

Use the public admin account created by this stack's seed. The following values belong to the local test database.

```powershell
Set-Location -LiteralPath $pstFrameworkDir
$env:TEST_ENV = "dev"
$env:TEST_BROWSER = "chromium"
$env:HEADLESS = "true"
$env:API_ADMIN_EMAIL = "admin@practicesoftwaretesting.com"
$env:API_ADMIN_PASSWORD = "welcome01"

npm ci
npx playwright install
npm test -- tests/ui
```

Set `TEST_BROWSER` to an empty string to run the environment's full browser list. Use `npm test -- tests/api --project=api` for API-only tests. Each new terminal session needs the environment variables set again; see [Environment Variables](#environment-variables).

### Stop the application

In the same session, stop this Compose project and remove its local test database volumes:

```powershell
docker compose down --volumes --remove-orphans
if ($LASTEXITCODE -ne 0) { throw "Application cleanup failed." }
Remove-Item Env:COMPOSE_FILE, Env:COMPOSE_PROJECT_NAME, Env:SPRINT, Env:DISABLE_LOGGING -ErrorAction SilentlyContinue
```

To start again after cleanup, repeat container configuration, dependency setup, and database initialization using the existing application checkout. CI performs these steps automatically with its own project name; see [CI](./ci.md).

## UI Tests

Install browser binaries before running UI tests:

```bash
npx playwright install
```

Start the Docker stack and set `TEST_ENV=dev` in `.env` or your shell, then run either login-flow suite:

```bash
npm test -- tests/ui/smoke
npm test -- tests/ui/regression
```

Smoke tests cover sign-in, the account page, and sign-out. Regression tests cover an incorrect password and password recovery followed by sign-in. Each test creates its own user through the API and deletes it during teardown, so admin API credentials are required.

Check discovery without launching browsers or sending API requests:

```bash
npm test -- tests/ui --list --reporter=list
```

These commands respect `TEST_BROWSER`. If it is empty or unset, all browser projects configured for the selected environment are used.

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
TEST_ENV=dev
TEST_BROWSER=chromium
HEADLESS=true
```

Then run `npm test`, `npm test -- tests/ui`, or `npm test -- tests/api --project=api`.

A missing, empty, or whitespace-only `TEST_BROWSER` uses the selected environment's configured browser list. An invalid browser name fails configuration loading. This behavior is the same locally and in CI; the API project remains separate.

PowerShell overrides:

```powershell
$env:TEST_ENV = "dev"
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

