# Environment Config

Environment config lives in the `config/` folder.

## Files

| File | Purpose |
| --- | --- |
| `config/env.ts` | Loads the optional root `.env`, selects the environment, and applies browser and headless overrides. |
| `.env` | Optional root environment variables; currently tracked by Git. |
| `config/types/types.ts` | Defines environment types and the supported browser project list. |
| `config/environments/dev.ts` | Dev environment values. |
| `config/environments/stage.ts` | Stage environment values. |
| `config/environments/prod.ts` | Prod environment values. |

## Environment Type

The `Environment` interface describes the static values stored in each environment config. `ResolvedEnvironment` extends it with the runtime `headless` boolean and is the explicit return type of `getEnvironment()`.

```ts
export interface Environment {
    baseURL: string;
    baseApiURL: string;
    timeout: number;
    retries: number;
    projects: readonly EnvironmentProject[];
}
```

The resolved configuration includes the computed headless setting:

```ts
export interface ResolvedEnvironment extends Environment {
    headless: boolean;
}
```

The `EnvironmentName` type defines allowed environment names.

```ts
export type EnvironmentName = "dev" | "stage" | "prod";
```

The `supportedBrowserProjects` array defines the browser projects available for runtime validation. `EnvironmentProject` is derived from this same list.

```ts
export const supportedBrowserProjects = [
    "chromium",
    "firefox",
    "webkit",
    "mobile-chrome",
    "mobile-safari",
] as const;

export type EnvironmentProject =
    (typeof supportedBrowserProjects)[number];
```

## Current Environment

`process.env` contains variables available to the Node.js process. It does not automatically read `.env` files.

When `config/env.ts` is imported, it loads the optional root `.env` before the environment is selected:

```ts
const envFilePath = resolve(__dirname, "../.env");

if (existsSync(envFilePath)) {
    loadEnvFile(envFilePath);
}
```

`loadEnvFile()` reads the file into `process.env`. The `existsSync()` check avoids a missing-file error when `.env` is absent, such as in CI. Variables already supplied by the shell or CI take precedence over values from the file. Without `.env`, the project uses those process variables directly. The loader requires Node.js 20.12+.

The local `.env` supports these variables:

```dotenv
TEST_ENV=dev
TEST_BROWSER=
API_ADMIN_EMAIL=
API_ADMIN_PASSWORD=
HEADLESS=false
```

This file demonstrates one configuration approach and is currently tracked by Git. Keep private credentials in process environment variables or a secrets manager such as Vault, with secret references for each environment. CI or runtime setup should resolve those references and inject the values through environment variables. The framework does not resolve Vault references itself.

`API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD` are read by `ApiRequestHelper.getApiToken()` for ordinary API client requests. They must identify an existing admin account for the selected API environment. Leaving them empty allows configuration to load, but these requests fail with a missing-credentials error. `getUserApiToken({ email, password })` and `getUserStorageState({ email, password })` use the explicitly supplied credentials instead. Adding credential fields to `dev.ts`, `stage.ts`, or `prod.ts` does not populate `process.env`.

The current environment is read from `process.env.TEST_ENV`.

```ts
const environmentName = process.env.TEST_ENV || "dev";
```

If `TEST_ENV` is not set, the project uses `dev`.

If `TEST_ENV` has an unknown value, the project throws an error.

## Browser Selection

Set `TEST_BROWSER` to select one browser project locally or in CI.

Supported values: `chromium`, `firefox`, `webkit`,
`mobile-chrome`, and `mobile-safari`.

If the value is missing, empty, or contains only whitespace,
the selected environment's `projects` list is used.
An unknown value raises an error listing the supported values.
Values are case-sensitive; leading and trailing whitespace is trimmed.

The API project remains available separately. Set `TEST_ENV`, `TEST_BROWSER`, and `HEADLESS` in the optional `.env` or your shell before running tests. See [Test Commands](./commands.md#test-commands).

```dotenv
TEST_ENV=dev
TEST_BROWSER=firefox
```

Start the dev stack using [Local Docker Setup](./commands.md#local-docker-setup), then select a browser in PowerShell:

```powershell
$env:TEST_ENV = "dev"
$env:TEST_BROWSER = "firefox"
npm test -- tests/ui
```

After changing the configuration, refresh tests in VS Code
and select the browser project in the Playwright sidebar.

## Headless Mode

`getEnvironment()` resolves headless mode after the optional `.env` has been loaded. The default `true` is defined in this method; the dev, stage, and prod config files do not store `headless`:

```ts
const headless = process.env.CI
    ? true
    : (process.env.HEADLESS || "true") === "true";

return {
    ...environment,
    headless,
};
```

A non-empty `CI` variable forces headless mode, including when `HEADLESS=false`. The CI workflow runs `npx playwright test` and uses the boolean resolved by `getEnvironment()`.

Outside CI, `HEADLESS=true` runs browsers without a window; `HEADLESS=false` opens browser windows. If the variable is missing or empty, `getEnvironment()` defaults to `true`. The comparison is case-sensitive: among non-empty values, only `"true"` enables headless mode; other values produce `false`. There is no separate validation step.

The local example uses `HEADLESS=false`. An existing shell or CI variable takes precedence over `.env`. This setting is applied to browser projects in `availableProjects`; API-only tests do not launch a browser.

## Getting Config

Use `getEnvironment()` to get the selected config as `ResolvedEnvironment`.

```ts
import { getEnvironment } from "../config/env";

const env = getEnvironment();
```

## Local Docker Application

CI uses the Docker-based dev environment because Cloudflare served security-verification pages to requests from GitHub Actions when tests targeted the public practicesoftwaretesting.com site. Those pages prevented the UI tests from reaching the application. Running the UI and API on localhost removes this dependency on the public site's Cloudflare checks. See [CI](./ci.md) for application startup, database initialization, and cleanup.

## Current Values

| Environment | `baseURL` |
| --- | --- |
| `dev` | `http://localhost:4200` |
| `stage` | `https://stage.practicesoftwaretesting.com/` |
| `prod` | `https://practicesoftwaretesting.com/` |

Dev uses the local Docker application. The stage UI URL is a placeholder. Prod uses the public Practice Software Testing UI.

| Environment | `baseApiURL` | `timeout` | `retries` | `projects` (default) |
| --- | --- | --- | --- | --- |
| `dev` | `http://localhost:8091` | `middleWaitTimeout` | `0` | `chromium`, `webkit`, `mobile-chrome`, `mobile-safari` |
| `stage` | `https://api.practicesoftwaretesting.com` | `middleWaitTimeout` | `0` | `chromium`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari` |
| `prod` | `https://api.practicesoftwaretesting.com` | `middleWaitTimeout` | `0` | `chromium`, `webkit`, `mobile-chrome`, `mobile-safari` |

CI starts the dev UI, API, and database through Docker Compose. For local dev runs, start the application stack before running tests. Stage and prod share the public API.

Product relation IDs are not stored in environment configs. Product specs obtain current category, brand, and image IDs through `ProductsApi.getAll()` and `getById()` and pass them to `getCreateProductRequest()`.

