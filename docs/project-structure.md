# Project Structure

This project has a simple structure for a modern Playwright test framework.

## Root Folders

| Path | Purpose |
| --- | --- |
| `api/` | Place for API clients, API helpers, and request logic. |
| `agents/` | Test generation instructions in `generate-e2e-instruction.md`; currently covers API tests. |
| `helpers/` | Shared helpers, including `ApiRequestHelper`, `getRegisterUserRequest` in `requestHelper.ts` for generating request data, and the Pino loggers in `loggerHelper.ts`. |
| `helpers/types/` | Place for helper-related types. |
| `pages/` | Place for page objects used by UI tests. |
| `config/` | Place for environment config and config types. |
| `constants/` | Place for shared constant values. |
| `tests/` | Place for all Playwright tests. |
| `.github/workflows/` | Place for GitHub Actions workflows. |
| `docs/` | Project documentation. |

## Test Folders

| Path | Purpose |
| --- | --- |
| `tests/api/` | API tests. |
| `tests/api/smoke/` | API smoke tests, including the user registration spec `userApi.spec.ts`. |
| `tests/ui/` | UI tests. |
| `tests/visual/` | Visual tests and visual checks. |
| `tests/accessibility/` | Accessibility tests. |
| `tests/performance/` | Performance tests. |

## Placeholder Files

Some folders have `.gitkeep` files. They keep empty folders in Git.

