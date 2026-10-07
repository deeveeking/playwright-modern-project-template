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

## Environment Variable

The environment config reads `process.env.TEST_ENV`.

The `test:dev`, `test:stage`, and `test:prod` scripts set this value before running Playwright.

