# E2E Test Generation Instructions

## API

### Location and naming

- Place API tests in `tests/api/`; place smoke tests in `tests/api/smoke/`.
- Name spec files after the API being tested, for example `userApi.spec.ts`.
- Group related tests with `test.describe`, for example `User API Smoke Tests`.
- Write test titles in English and describe the expected behavior and conditions. Preserve titles explicitly supplied by the user.
- Use TypeScript, four-space indentation, double quotes, and semicolons, following the existing API tests.
- Import `test` and `expect` from `@playwright/test`. Use `import type` for type-only imports.
- Keep imports relative and update them when moving a spec into another directory.
- Generate executable tests without `test.skip` or `test.only`, unless explicitly requested.

### Setup and teardown

- Declare API client variables inside `test.describe` so tests in that block can use them.
- Initialize clients in `test.beforeAll` using the property getters on `ApiFactory`, such as `userApi = ApiFactory.userApi`.
- Use `test.beforeAll` and `test.afterAll` for suite setup and teardown.
- Call `await ApiRequestHelper.dispose()` in `afterAll` to release the shared request context and clear the cached token.
- Each factory getter creates a new client. Do not add client caching, factory functions, enums, or a switch-based API selector when generating tests.
- Keep tests independent: do not rely on another test creating data or on execution order. Setup hooks may run again in another worker or on retry.
- For an update test, create a separate user in that test, copy its request data, and change only the target field. Check the update response and read the user back to verify the saved field. The current email update test searches by full name and compares `data[0].email`. Updating this new user through the shared environment account requires admin credentials.
- Disposing the request context does not delete server data. Record the IDs created by registration and update tests in `createdUserIds`; delete them in `afterAll` before disposing the context. The deletion test deletes its own user and does not add its ID to this list. `UserApi.delete` requires an admin account, so the whole current smoke suite requires admin credentials.
- For a deletion test, create its user within the test and await deletion by the returned ID. The current test relies on the helper to throw for a non-success response; it does not separately assert the return value. Search by the unique email afterward and check both an empty `data` array and `total: 0`.

### Request data

- Generate payloads through functions exported from `helpers/requestHelper.ts`, such as `getRegisterUserRequest()`.
- Keep this helper as a module of `export const` functions, not a class.
- Give each generator an explicit request interface return type, such as `RegisterUserRequest`.
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
- `ApiRequestHelper.getApiToken()` obtains credentials from `API_EMAIL` and `API_PASSWORD`, performs login, and caches the token, including an in-progress login request.
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

This excerpt follows the setup, cleanup, and registration case in [the current smoke spec](../tests/api/smoke/userApi.spec.ts). That file also contains the independent email update and deletion cases.

```ts
import { expect, test } from "@playwright/test";
import { ApiFactory } from "../../../api/apiFactory";
import type { UserApi } from "../../../api/userApi/userApi";
import { ApiRequestHelper } from "../../../helpers/apiRequestHelper";
import { getRegisterUserRequest, getSearchUserRequest } from "../../../helpers/requestHelper";

test.describe("User API Smoke Tests", () => {
    let userApi: UserApi;
    let createdUserIds: string[] = [];

    test.beforeAll(async () => {
        userApi = ApiFactory.userApi;
    });

    test.afterAll(async () => {
        await Promise.all(createdUserIds.map(async (id) => await userApi.delete(id)));
        await ApiRequestHelper.dispose();
    });

    test("User is registered successfuly with correct data", async () => {
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
        };
        const expectedGetUserResponse = {
            ...expectedResponse,
            provider: null,
            totp_enabled: false,
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

### Validation and execution

- API tests run in the `api` Playwright project. Keep them excluded from browser projects.
- Do not request `page`, `browser`, or browser `context` fixtures in API-only tests.
- Check test discovery and imports with `npx playwright test --project=api --list --reporter=list`.
- Run API smoke tests with `npx playwright test tests/api/smoke --project=api` using the configured environment and credentials.
- Report validation accurately: listing tests does not execute requests or prove that the API assertions pass.

## UI
