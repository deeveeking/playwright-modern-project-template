# Environment Config

Environment config lives in the `config/` folder.

## Files

| File | Purpose |
| --- | --- |
| `config/env.ts` | Selects the current environment config. |
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

The current environment is read from `process.env.TEST_ENV`.

```ts
const environmentName = process.env.TEST_ENV;
```

If `TEST_ENV` is not set, the project uses `dev`.

If `TEST_ENV` has an unknown value, the project throws an error.

## Getting Config

Use `getEnvironment()` to get the selected config.

```ts
import { getEnvironment } from "../config/env";

const env = getEnvironment();
```

## Current Values

| Environment | `baseApiURL` | `timeout` | `retries` | `projects` |
| --- | --- | --- | --- | --- |
| `dev` | `https://reqres.in` | `middleWaitTimeout` | `0` | `chromium` |
| `stage` | `https://staging.reqres.in` | `middleWaitTimeout` | `0` | `chromium`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari` |
| `prod` | `https://reqres.in` | `0` | `0` | `chromium`, `webkit`, `mobile-chrome`, `mobile-safari` |

