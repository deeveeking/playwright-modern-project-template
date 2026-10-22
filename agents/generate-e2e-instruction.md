# E2E Test Generation Instructions

## API

### Location and naming

- Place API tests in `tests/api/`; place smoke specs directly in `tests/api/smoke/` and regression specs directly in `tests/api/regression/`. Do not add an `admin` subfolder.
- Name spec files after the API being tested, for example `adminUserApi.spec.ts`.
- Group related tests with `test.describe`, for example `Admin User API Smoke Tests`.
- Write test titles in English and describe the expected behavior and conditions. Preserve titles explicitly supplied by the user.
- Use TypeScript, four-space indentation, double quotes, and semicolons, following the existing API tests.
- All API specs import `test` and `expect` from `fixtures/apiFixture.ts` and request `{ userApi }`, `{ productsApi }`, or `{ categoryApi }` in tests and hooks. Use `import type` for type-only imports.
- Keep imports relative and update them when moving a spec into another directory.
- Generate executable tests without `test.skip` or `test.only`, unless explicitly requested.

### Setup and teardown

- The worker-scoped client fixtures instantiate `UserApi`, `ProductsApi`, and `CategoryApi` directly in `fixtures/apiFixture.ts`. Tests receive clients through fixture parameters. Do not duplicate client setup or HTTP-context disposal in spec hooks.
- Product specs keep `beforeAll({ productsApi })` to obtain relation references. User and category specs do not need a hook solely to initialize a client.
- Use `test.beforeAll` and `test.afterAll` for suite setup and teardown.
- The worker-scoped `_apiLifecycle` fixture uses `auto: true` to close the shared context once after ordinary fixtures finish, including failed test-data cleanup. Do not add unused `_apiLifecycle` parameters to API client fixtures, request it directly in specs, or add `ApiRequestHelper.dispose()` to API spec hooks.
- Each requested API client is created once per worker. Keep API client creation in `fixtures/apiFixture.ts`; do not add factories, manual client caches, enums, or a switch-based API selector when generating tests.
- Keep tests independent: do not rely on another test creating data or on execution order. Setup hooks may run again in another worker or on retry.
- For an update test, create a separate user in that test, copy its request data, and change only the target field. Check the update response and read the user back to verify the saved field. The current email update test searches by full name and compares `data[0].email`. Updating this new user through the shared environment account requires admin credentials.
- Disposing the request context does not delete server data. Record the IDs created by registration and update tests in `createdUserIds`; delete them in `afterAll` through its `userApi` argument. The deletion test deletes its own user and does not add its ID to this list. `UserApi.delete` requires an admin account, so the whole current smoke suite requires admin credentials.
- For a deletion test, create its user within the test and await deletion by the returned ID. The current test relies on the helper to throw for a non-success response; it does not separately assert the return value. Search by the unique email afterward and check both an empty `data` array and `total: 0`.

### Request data

- Generate payloads through functions exported from `helpers/requestHelper.ts`, such as `getRegisterUserRequest()`.
- Keep this helper as a module of `export const` functions, not a class.
- Give each generator an explicit request interface return type, such as `RegisterUserRequest`.
- For products, use `getCreateProductRequest(categoryId, brandId, productImageId)`. Obtain these IDs from an existing product in the selected environment through `ProductsApi.getAll()` and `getById()`; do not hardcode or randomly generate foreign keys.
- Product setup reuses existing relation data to keep this architecture example simple. Preparing related data before each test is an alternative. Follow the current setup without a separate `products.data.length` assertion.
- For categories, use `getCreateCategoryRequest()`. It creates a root category payload with a random name, unique slug, and `parent_id: null`, without relying on existing catalog data.
- Use `@faker-js/faker` for random test data. Generate fresh data for each independent scenario.
- Preserve API constraints when generating data: field lengths, formats, age limits, password rules, and uniqueness requirements.
- Registration emails use a UUID and the `example.com` domain to reduce collisions.
- Keep password generation simple: `faker.internet.password({ length: 12, prefix: "Aa1!" })`.
- Use `YYYY-MM-DD` for dates of birth and a two-letter country code for registration addresses.
- Define object request and response models with `interface` in the corresponding API's `types.ts` file. Follow names such as `RegisterUserRequest` and `RegisterUserResponse`; use type aliases for non-object types such as arrays or `void`.
- For negative scenarios, generate valid data first and explicitly change the field relevant to the scenario.

### Requests and authorization

- Call API client methods from tests, for example `await userApi.register(request)`.
- API clients live under `api/` and delegate HTTP requests to `ApiRequestHelper`. Reuse existing methods and models before adding new ones.
- Accept a single resource ID as a string, for example `userApi.delete(userId)` or `productsApi.getById(productId)`. Do not create a request interface solely to wrap an ID. Put the ID in the URL when the endpoint defines a path parameter; retain request interfaces for object payloads and query parameters.
- Do not duplicate HTTP transport, authorization, or response logging in the spec.
- `ApiRequestHelper.getApiToken()` obtains credentials from `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD`, performs login, and caches the token, including an in-progress login request.
- `getUserApiToken({ email, password })` performs an uncached login for explicit credentials. It does not switch the admin account used by API clients. `helpers/authHelper.ts` prepares browser storage state through `getUserStorageState()`; keep browser authentication separate from these admin API suites.
- Ordinary helper requests always attach the cached Bearer token, including registration. The credentials must therefore belong to an existing account in the selected environment.
- Keep login in the request helper; do not add a `UserApi.login` method, an `authenticated` flag, or custom authorization headers to tests.
- Use `TEST_ENV` and the existing environment configuration for API URLs. Do not hardcode credentials or base URLs in specs. Prefer credentials injected from a secret manager; local `.env` files must be excluded from Git.
- The helper owns a shared context and token within a worker. Do not assume different API client instances represent independent authenticated users.
- API client methods return parsed response data, not Playwright `APIResponse` objects. Do not call `.status()`, `.ok()`, or `.json()` on their results.
- Non-success HTTP responses and transport errors reject the client call. For negative tests, assert the rejected promise using `.rejects` rather than treating the error body as a successful response.
- A successful `204` response returns `undefined`.

### Expected responses and assertions

- Use `request`, `expectedResponse`, and `response` for the payload, expected response, and actual response.
- Build `expectedResponse` from the request data and the endpoint's documented response contract before comparing it with the actual response.
- Do not copy actual response fields into `expectedResponse` to make the assertion pass.
- Use the built-in `expect.any(String)` for server-generated string fields such as `id` and `created_at`, following the current registration test. This checks the type and accepts empty strings; it does not validate the date format.
- API client methods already declare response interfaces, so the type of `response` is inferred from the method. Let TypeScript infer `expectedResponse` when it includes Playwright matchers: these matchers are objects, not the strings declared by the response interface. Do not use casts to hide this mismatch.
- Include all expected response fields. `toEqual()` checks the complete object, so unexpected fields should cause a failure. Check endpoint-specific server fields rather than assuming every endpoint returns the same user shape.
- Do not include the registration password in the expected response.
- Compare the response using `toEqual(expectedResponse)`, not `toMatchObject()` or `expect.objectContaining()`.
- Add a clear custom assertion message. Use this exact multiline layout:

```ts
        expect(response,
            "Response is incorrect")
            .toEqual(expectedResponse);
```

### Registration test example

This excerpt follows the setup, cleanup, and registration case in [the current smoke spec](../tests/api/smoke/adminUserApi.spec.ts). That file also contains the independent email update and deletion cases.

```ts
import { expect, test } from "../../../fixtures/apiFixture";
import { getRegisterUserRequest, getSearchUserRequest } from "../../../helpers/requestHelper";

test.describe("Admin User API Smoke Tests", () => {
    let createdUserIds: string[] = [];

    test.afterAll(async ({ userApi }) => {
        await Promise.all(createdUserIds.map(async (id) => await userApi.delete(id)));
    });

    test("Admin is register user successfuly with correct data", async ({ userApi }) => {
        const request = getRegisterUserRequest();

        const expectedResponse = {
            id: expect.any(String),
            first_name: request.first_name,
            last_name: request.last_name,
            email: request.email,
            address: request.address,
            phone: request.phone,
            dob: request.dob,
            created_at: expect.any(String),
            enabled: null,
            failed_login_attempts: null,
            role: "user",
        };
        const expectedGetUserResponse = {
            ...expectedResponse,
            provider: null,
            totp_enabled: false,
            failed_login_attempts: 0,
            enabled: true,
        };

        const response = await userApi.register(request);
        createdUserIds.push(response.id);
        const searchUserRequest = getSearchUserRequest(`${response.first_name} ${response.last_name}`);
        const getUserResponse = await userApi.search(searchUserRequest);

        expect(response,
            "Register response is incorrect")
            .toEqual(expectedResponse);
        expect(getUserResponse.data[0],
            'Incorrect search response')
            .toEqual(expectedGetUserResponse);
    });
});
```

### Regression scenarios

- Keep the three regression specs directly in `tests/api/regression/`, mirroring the smoke filenames.
- The registration case uses `email: " "` and `password: " "` together and expects 422. Do not describe it as omitted fields or independent validation of each field. The previous malformed-email case was replaced because the server accepted that input.
- The user update case creates a valid user, sends a 257-character email, expects 422, then searches by the original email and selects the user by ID to verify that the email was preserved.
- The user search case creates and deletes its own user, then checks `data: []` and `total: 0`. Do not add a repeated-user-deletion case.
- Product and category cases cover an empty name (422) and retrieval of a resource created and deleted within the same test (404).
- Use `await expect(promise, "message").rejects.toThrow(...)` for HTTP errors, checking the target method, URL, and status. Do not accept any rejection without identifying the expected request failure.
- Do not add `.then()` cleanup to invalid creation cases. They expect no resource to be created. Record the user from the invalid-update case for `afterAll`; the deleted-user search case deletes its own user without adding it to the cleanup set.
- Product and category retrieval cases track their created IDs and remove them from the set after successful deletion. Their `afterAll` hooks receive the matching API client and delete remaining recorded resources, without `try/catch/finally`. The shared fixture owns HTTP-context disposal.

### Validation and execution

- The product example is [adminProducts.spec.ts](../tests/api/smoke/adminProducts.spec.ts). Its create and get-by-ID cases create separate products and compare complete responses with `toEqual()`. Creation includes the brand slug, while the detail response includes `specs`; expectations must respect these endpoint differences.
- Record created product IDs before assertions. Delete them with `Promise.all` in `afterAll({ productsApi })`. Keep this hook without `try/catch/finally`. Do not delete the existing product used for reference data. Context disposal belongs to the shared worker fixture.
- The category example is [adminCategory.spec.ts](../tests/api/smoke/adminCategory.spec.ts). Create a separate category for each case and compare complete responses. Retrieval by ID includes `sub_categories: []` for a newly created root category. Record IDs before assertions and delete them through `CategoryApi.delete()` in `afterAll` using the same cleanup pattern as products.

- API tests run in the `api` Playwright project. Keep them excluded from browser projects.
- Do not request `page`, `browser`, or browser `context` fixtures in API-only tests.
- Check test discovery and imports with `npx playwright test --project=api --list --reporter=list`.
- Run API smoke tests with `npx playwright test tests/api/smoke --project=api` using the configured environment and credentials.
- Run API regression tests with `npx playwright test tests/api/regression --project=api` using the configured environment and credentials.
- Report validation accurately: listing tests does not execute requests or prove that the API assertions pass.

## UI

- Import `test` and `expect` from `fixtures/browserFixture.ts` for home-page navigation and prepared authentication. The exported test inherits `userApi` from `apiFixture.ts` and `user` from `userFixture.ts`.
- Requesting `page` uses a fresh user by default, prepares its token through `getUserStorageState()`, creates the isolated browser context, and opens `/` using the project's `baseURL`.
- Tests can request `user` to access its `credentials`, optional `profile`, and `cleanup()` method. Use `user.cleanup()` when intentionally deleting a fixture-created user; direct deletion through `userApi` would leave its cleanup bookkeeping unchanged.
- Existing accounts are supplied with `test.use({ userCredentials: { email, password } })`. They are not registered or deleted; their `profile` is undefined and `cleanup()` does nothing.
- For login and other unauthenticated tests, use `test.use({ storageState: { cookies: [], origins: [] } })` within the appropriate file or group. Do not request `user` in these tests or hooks unless account creation is explicitly needed.
- Keep browser and page lifecycle management with Playwright. The `user` fixture deletes its created user after each test, and the automatic `_apiLifecycle` fixture disposes the shared API context at worker teardown after API clients and user fixtures finish.
- Use `TEST_ENV=prod` for the current public UI. Dev and stage UI URLs are illustrative placeholders. Tests creating users require admin API credentials for registration and cleanup.
- See [Test Fixtures](../docs/fixtures.md) for lifecycle details and usage examples. No UI specs have been implemented yet.
