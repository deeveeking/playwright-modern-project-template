# Category API

`api/categoryApi/categoryApi.ts` exports `CategoryApi`. Obtain a new instance through `ApiFactory.categoryApi`; the factory does not cache clients. Authorization, logging, and error handling use the shared `ApiRequestHelper`.

The interfaces in `api/categoryApi/types.ts` follow the [Category Swagger documentation](https://api.practicesoftwaretesting.com/api/documentation#/Category).

| Method | HTTP request | Request | Response |
| --- | --- | --- | --- |
| `create(body)` | `POST /categories` | `CreateCategoryRequest` JSON body | `CreateCategoryResponse` |
| `getById(categoryId)` | `GET /categories/tree/{categoryId}` | String ID in the path | `GetCategoryResponse`, including `sub_categories` |
| `delete(categoryId)` | `DELETE /categories/{categoryId}` | String ID in the path | `DeleteCategoryResponse` (`void`, HTTP 204) |

The documented GET-by-ID route contains `/tree/` and returns the category with its subcategories. The ID is URL-encoded before sending the request.

The creation payload contains `name`, `slug`, and `parent_id`. `parent_id` can be `null` for a root category or the ID of an existing parent. Swagger does not mark request fields as required, so the interface leaves them optional; the server still validates the payload. Responses include `id`, `parent_id`, `name`, and `slug`; tree responses also include `sub_categories`.

```ts
import { ApiFactory } from "../api/apiFactory";
import { ApiRequestHelper } from "../helpers/apiRequestHelper";
import type { CreateCategoryRequest } from "../api/categoryApi/types";

const categoryApi = ApiFactory.categoryApi;
const payload: CreateCategoryRequest = {
    name: "Test tools",
    slug: `test-tools-${Date.now()}`,
    parent_id: null,
};

try {
    const created = await categoryApi.create(payload);
    const category = await categoryApi.getById(created.id);
} finally {
    await ApiRequestHelper.dispose();
}
```

Set `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD` for an existing admin account in the selected environment. Deletion requires the admin role. The helper adds a Bearer token to every request. Unsuccessful responses throw; the interfaces describe successful results and do not validate JSON at runtime.

## Smoke tests

[adminCategory.spec.ts](../tests/api/smoke/adminCategory.spec.ts) covers creation and retrieval by ID. Each test creates its own root category using `getCreateCategoryRequest()` from `helpers/requestHelper.ts`, with random name and slug and `parent_id: null`. No existing catalog data is required.

Both category specs import `test` and `expect` from `fixtures/apiFixture.ts` and receive the worker-scoped `categoryApi` through tests and hooks. No `beforeAll` hook is needed to instantiate the client.

Both smoke tests compare the complete response with `expectedResponse` using `toEqual()`. Creation checks a server-generated string ID; retrieval checks the created ID and an empty `sub_categories` array. IDs are recorded before assertions. `afterAll({ categoryApi })` deletes the recorded categories with `Promise.all`. The shared `_apiLifecycle` fixture disposes the request context at worker teardown, including when server-data cleanup fails. See [Test Fixtures](./fixtures.md).

## Regression tests

[adminCategory.spec.ts](../tests/api/regression/adminCategory.spec.ts) contains two independent cases:

- Creating a category with `name: ""` expects status 422.
- Retrieving a category after creating and deleting it expects status 404.

Both use `.rejects.toThrow()` with the method, URL, and status. The retrieval case records its category ID for cleanup and removes it from the set after successful deletion. `afterAll({ categoryApi })` deletes any IDs still recorded; the shared fixture owns request-context disposal. The invalid creation case expects no category to be created and does not register an ID for cleanup.
