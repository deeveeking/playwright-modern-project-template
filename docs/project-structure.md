# Project Structure

This project has a simple structure for a modern Playwright test framework.

## Root Folders

| Path | Purpose |
| --- | --- |
| `api/` | Place for API clients, API helpers, and request logic. |
| `agents/` | API test generation instructions and UI fixture conventions in `generate-e2e-instruction.md`. |
| `fixtures/` | Four fixture layers for worker-scoped API clients, test users, authenticated browser pages, and page objects. See [Test Fixtures](./fixtures.md). |
| `helpers/` | Shared helpers, including `ApiRequestHelper`, request generators (`getRegisterUserRequest`, `getSearchUserRequest`, `getCreateProductRequest`, `getCreateCategoryRequest`) in `requestHelper.ts`, and the Pino loggers in `loggerHelper.ts`. |
| `helpers/authHelper.ts` | `getUserStorageState()` prepares in-memory browser storage state with a user token in `localStorage["auth-token"]`. |
| `helpers/types/` | Place for helper-related types. |
| `pages/` | Page objects for the catalog, product details, cart, login, account, and password recovery. |
| `pages/components/` | Shared UI components, including `HeaderComponent`, exposed through each page object's `header` property. |
| `data/` | Expected UI text in `staticTestMessages.ts`, shared by UI specs. |
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
| `tests/ui/` | UI smoke and regression specs using page-object fixtures. |
| `tests/ui/smoke/` | Two login-flow cases covering sign-in, account-page elements, sign-out, and protected account access. |
| `tests/ui/regression/` | Two login-flow cases covering an incorrect password and password recovery followed by sign-in. |
| `tests/visual/` | Visual tests and visual checks. |
| `tests/accessibility/` | Accessibility tests. |
| `tests/performance/` | Performance tests. |

The six implemented API specs sit directly under `smoke/` and `regression/`; there is no `admin/` subfolder. Their filenames retain the `admin` prefix because the suites use admin credentials. There are seven tests in each suite.

## Page Objects and Locator Scope

`page` represents the browser tab. `container` and `form` are
descriptive names for `Locator` fields that narrow the search scope.

```ts
const container = page.locator("app-forgot-password");
const form = container.getByTestId("forgot-password-form");
const emailInput = form.getByTestId("email");
```

Here, Playwright finds the page component, then the form inside it,
then the email input inside that form. All locators use the same
browser page.

Scoping helps avoid ambiguous matches when components contain
repeated controls. Use `page.getByTestId()` directly when the selector
is unique across the page.

## Shared UI Components and Messages

`fixtures/pagesFixture.ts` supplies page objects for the current test. Each page object composes a `HeaderComponent` using that same browser page; specs use methods such as `accountPage.header.signOut()` for shared navigation.

Expected UI copy lives in `data/staticTestMessages.ts` for clarity. Specs import these values for explicit text assertions. In a real application, a manifest API can provide the source text when available; this example keeps a static snapshot. Locators and UI actions belong in page objects and components.

## Placeholder Files

Some folders have `.gitkeep` files. They keep empty folders in Git.

