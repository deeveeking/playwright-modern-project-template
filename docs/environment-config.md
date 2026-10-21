# Environment Config

Environment config lives in the `config/` folder.

## Files

| File | Purpose |
| --- | --- |
| `config/env.ts` | Loads the optional root `.env` and selects the current environment config. |
| `.env` | Optional local variables; ignored by Git. |
| `config/types/types.ts` | Defines environment types. |
| `config/environments/dev.ts` | Dev environment values. |
| `config/environments/stage.ts` | Stage environment values. |
| `config/environments/prod.ts` | Prod environment values. |

## Environment Type

The `Environment` interface describes the shape of each environment config.

```ts
export interface Environment {
    baseURL: string;
    baseApiURL: string;
    headless: boolean;
    timeout: number;
    retries: number;
    projects: readonly EnvironmentProject[];
}
```

The `EnvironmentName` type defines allowed environment names.

```ts
export type EnvironmentName = "dev" | "stage" | "prod";
```

The `EnvironmentProject` type defines allowed Playwright projects.

```ts
export type EnvironmentProject =
    | "chromium"
    | "firefox"
    | "webkit"
    | "mobile-chrome"
    | "mobile-safari";
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
API_ADMIN_EMAIL=
API_ADMIN_PASSWORD=
HEADLESS=false
```

This file demonstrates one configuration approach and is excluded by `.gitignore`. Fill in credentials locally only if needed. Prefer storing secrets in Vault or another secrets manager, with secret references for each environment. CI or runtime setup should resolve those references and inject the values through environment variables. Use `.env` only as a fallback, after excluding it from Git; the framework does not resolve Vault references itself.

`API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD` are read by `ApiRequestHelper.getApiToken()` for ordinary API client requests. They must identify an existing admin account for the selected API environment. Leaving them empty allows configuration to load, but these requests fail with a missing-credentials error. `getUserApiToken({ email, password })` and `getUserStorageState({ email, password })` use the explicitly supplied credentials instead. Adding credential fields to `dev.ts`, `stage.ts`, or `prod.ts` does not populate `process.env`.

The current environment is read from `process.env.TEST_ENV`.

```ts
const environmentName = process.env.TEST_ENV || "dev";
```

If `TEST_ENV` is not set, the project uses `dev`.

If `TEST_ENV` has an unknown value, the project throws an error.

## Headless Mode

Each environment config defines `headless: true` as its default. `getEnvironment()` reads `process.env.HEADLESS` after the optional `.env` has been loaded:

```ts
const headless = process.env.HEADLESS;

return {
    ...environment,
    headless: headless
        ? headless === "true"
        : environment.headless,
};
```

`HEADLESS=true` runs browsers without a window; `HEADLESS=false` opens browser windows. If the variable is missing or empty, the selected config's boolean is used. The comparison is case-sensitive: only the non-empty string `"true"` enables headless mode; other non-empty values produce `false`. There is no separate validation step.

The local example uses `HEADLESS=false`. An existing shell or CI variable takes precedence over `.env`. This setting is applied to browser projects in `availableProjects`; API-only tests do not launch a browser.

## Getting Config

Use `getEnvironment()` to get the selected config.

```ts
import { getEnvironment } from "../config/env";

const env = getEnvironment();
```

## Current Values

| Environment | `baseURL` |
| --- | --- |
| `dev` | `https://dev.practicesoftwaretesting.com/` |
| `stage` | `https://stage.practicesoftwaretesting.com/` |
| `prod` | `https://practicesoftwaretesting.com/` |

The dev and stage UI URLs are fake URLs for illustration only. Use prod for the public Practice Software Testing UI.

| Environment | `baseApiURL` | `timeout` | `retries` | `projects` |
| --- | --- | --- | --- | --- |
| `dev` | `http://localhost:8091` | `middleWaitTimeout` | `0` | `chromium` |
| `stage` | `https://api.practicesoftwaretesting.com` | `middleWaitTimeout` | `0` | `chromium`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari` |
| `prod` | `https://api.practicesoftwaretesting.com` | `middleWaitTimeout` | `0` | `chromium`, `webkit`, `mobile-chrome`, `mobile-safari` |

Stage and prod currently use the same API, so they do not isolate server data from each other. The local dev API must be started separately.

Product relation IDs are not stored in environment configs. Product specs obtain current category, brand, and image IDs through `ProductsApi.getAll()` and `getById()` and pass them to `getCreateProductRequest()`.

