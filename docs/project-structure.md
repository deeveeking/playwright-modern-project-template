# Project Structure

This project has a simple structure for a modern Playwright test framework.

## Root Folders

| Path | Purpose |
| --- | --- |
| `api/` | Place for API clients, API helpers, and request logic. |
| `agents/` | Test generation instructions in `generate-e2e-instruction.md`; currently covers API tests. |
| `helpers/` | Shared helpers, including `ApiRequestHelper`, request generators (`getRegisterUserRequest`, `getSearchUserRequest`, `getCreateProductRequest`, `getCreateCategoryRequest`) in `requestHelper.ts`, and the Pino loggers in `loggerHelper.ts`. |
| `helpers/authHelper.ts` | `getUserStorageState()` prepares in-memory browser storage state with a user token in `localStorage["auth-token"]`. |
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
| `tests/api/regression/` | Seven regression tests across user, product, and category API specs. |
| `tests/api/smoke/` | Smoke tests: `adminUserApi.spec.ts` covers registration, email update, and deletion; `adminProducts.spec.ts` and `adminCategory.spec.ts` cover creation and retrieval by ID for products and categories. |
| `tests/ui/` | UI test structure; no implemented UI specs yet. |
| `tests/visual/` | Visual tests and visual checks. |
| `tests/accessibility/` | Accessibility tests. |
| `tests/performance/` | Performance tests. |

The six implemented API specs sit directly under `smoke/` and `regression/`; there is no `admin/` subfolder. Their filenames retain the `admin` prefix because the suites use admin credentials. There are seven tests in each suite.

## Placeholder Files

Some folders have `.gitkeep` files. They keep empty folders in Git.

