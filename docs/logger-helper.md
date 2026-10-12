# Logger Helper

`helpers/loggerHelper.ts` exports `logger` and `httpLogger`.

## Application Logger

Use `logger` for application events and outgoing API requests:

```ts
import { logger } from "../helpers/loggerHelper";

logger.info("Test setup completed");
logger.warn({ userId: 42 }, "User was not found");
logger.error({ err: new Error("Setup failed") }, "Test setup failed");
```

The default level is `info`, so `debug` and `trace` messages are hidden. Set `logger.level = "debug"` to enable debug messages for the current process.

Pino uses `pino-pretty` to write colored logs to stdout with the level before the message. Process ID and hostname are hidden. Structured fields appear alongside the message.

## HTTP Logger

`httpLogger` is a `pino-http` middleware for incoming Node.js HTTP requests and responses. It shares the application logger. Its callback receives `(req, res, err)` and selects `warn` for 4xx, `error` for 5xx or errors on other statuses, and `info` otherwise.

Playwright's `APIRequestContext` sends outgoing requests, so [ApiRequestHelper](./api-request-helper.md#logging) uses `logger` directly. Callers do not need to invoke `httpLogger` for these requests.
