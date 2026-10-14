# Category API

`api/categoryApi/categoryApi.ts` exports `CategoryApi`. Obtain a new instance through `ApiFactory.categoryApi`; the factory does not cache clients. Authorization, logging, and error handling use the shared `ApiRequestHelper`.

The interfaces in `api/categoryApi/types.ts` follow the [Category Swagger documentation](https://api.practicesoftwaretesting.com/api/documentation#/Category).

| Method | HTTP request | Request | Response |
| --- | --- | --- | --- |
| `create(body)` | `POST /categories` | `CreateCategoryRequest` JSON body | `CreateCategoryResponse` |
| `getById(categoryId)` | `GET /categories/tree/{categoryId}` | String ID in the path | `GetCategoryResponse`, including `sub_categories` |

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

Set `API_EMAIL` and `API_PASSWORD` for an existing account in the selected environment. The helper adds a Bearer token to both requests. Unsuccessful responses throw; the interfaces describe successful results and do not validate JSON at runtime.
