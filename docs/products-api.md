# Products API

API tests receive the worker-scoped `productsApi` client from `fixtures/apiFixture.ts`, which creates it directly with `new ProductsApi()`.

Clients share the static `ApiRequestHelper` context and token; creating a client does not create a separate authenticated session.

See [Test Fixtures](./fixtures.md) for client lifecycle details and [Category API](./category-api.md) for category methods.

## Product Methods

`ProductsApi` is implemented in `api/productsApi/productsApi.ts` and provided through the `productsApi` fixture. Its request and response interfaces live in `api/productsApi/types.ts`, based on the [Product Swagger documentation](https://api.practicesoftwaretesting.com/api/documentation#/Product).

| Method | HTTP request | Request parameter | Response interface |
| --- | --- | --- | --- |
| `getAll()` | `GET /products` | None (first page) | `GetProductsResponse` |
| `create(body)` | `POST /products` | `CreateProductRequest` (JSON body) | `CreateProductResponse` |
| `getById(productId)` | `GET /products/{productId}` | `productId: string` (path parameter) | `GetProductResponse` |
| `delete(productId)` | `DELETE /products/{productId}` | `productId: string` (path parameter) | `DeleteProductResponse` (`void`, HTTP 204) |

The creation payload includes `name`, `description`, `price`, `category_id`, `brand_id`, `product_image_id`, `is_location_offer`, `is_rental`, and `co2_rating`. Swagger does not mark request fields as required, so the interface leaves them optional; server validation still applies. Supply existing category, brand, and image IDs from the selected environment.

`GetProductsResponse` contains `data` and pagination fields. Creation and detail responses include brand, category, and image objects. Creation returns the brand's `slug`; the detail endpoint returns the brand's ID and name and also includes a `specs` array. List categories can omit `parent_id`. These distinctions follow the [ProductService implementation](https://github.com/testsmith-io/practice-software-testing/blob/main/sprint5/API/app/Services/ProductService.php).

The request also supports `stock`, as implemented by the [Product model](https://github.com/testsmith-io/practice-software-testing/blob/main/sprint5/API/app/Models/Product.php). For admins, `in_stock` exposes the stock quantity (or `null` if unset); for other users it is a boolean. The response type represents both forms. These TypeScript interfaces do not perform runtime validation. Non-successful responses are handled by `ApiRequestHelper` and throw an error.

## Example

Set `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD` as described in [Environment Config](./environment-config.md#current-environment). The helper attaches a token to every product request. Deletion requires an admin account.

```ts
import { test } from "../fixtures/apiFixture";
import { getCreateProductRequest } from "../helpers/requestHelper";
import type { GetProductResponse } from "../api/productsApi/types";

let referenceProduct: GetProductResponse;
const createdProductIds: string[] = [];

test.beforeAll(async ({ productsApi }) => {
    const products = await productsApi.getAll();
    referenceProduct = await productsApi.getById(products.data[0].id);
});

test.afterAll(async ({ productsApi }) => {
    await Promise.all(createdProductIds.map(id => productsApi.delete(id)));
});

test("Create and read a product", async ({ productsApi }) => {
    const request = getCreateProductRequest(
        referenceProduct.category.id,
        referenceProduct.brand.id,
        referenceProduct.product_image.id
    );

    const response = await productsApi.create(request);
    createdProductIds.push(response.id);

    await productsApi.getById(response.id);
});
```

The example illustrates client calls and server-data cleanup. The fixture disposes the shared HTTP context; full response assertions are described in the smoke and regression sections below.

## Admin Product Smoke Tests

[`adminProducts.spec.ts`](../tests/api/smoke/adminProducts.spec.ts) contains two independent tests:

- `Admin is create product successfuly with correct data` generates a request, creates a product, and compares the complete creation response with `expectedResponse` using `toEqual()`.
- `Admin is get product by id successfuly` creates a separate product, retrieves it by ID, and compares the exact ID, submitted fields, related objects, and empty `specs` array with its expected response.

Both product specs import `test` and `expect` from `fixtures/apiFixture.ts`. The worker-scoped `productsApi` fixture creates its client directly with `new ProductsApi()`. `beforeAll({ productsApi })` reads the first product page and retrieves an existing product for valid category, brand, and image references. The selected environment must already contain a product with these relations. Reference products are read only and never scheduled for deletion.

Reusing reference data keeps this architecture example simple. Related data could instead be prepared before each test. The generator requires the three IDs as arguments; they are not hardcoded or read from environment configs. Setup directly accesses `products.data[0]` without a separate list-length assertion.

`getCreateProductRequest(categoryId, brandId, productImageId)` in `helpers/requestHelper.ts` uses Faker for a name with a UUID, description, positive two-decimal price, booleans, CO2 rating, and positive stock quantity. Existing relation IDs are passed in rather than randomly generated. The tests derive `is_eco_friendly` from rating A or B and expect admin `in_stock` to equal the submitted stock.

Each test records its created product ID before asserting the response. `afterAll({ productsApi })` deletes the recorded products with `Promise.all`. The shared `_apiLifecycle` fixture disposes the HTTP context at worker teardown, including when server-data cleanup fails. Specs do not call `dispose()` themselves. See [Test Fixtures](./fixtures.md).

```bash
npx playwright test tests/api/smoke/adminProducts.spec.ts --project=api
```

## Admin Product Regression Tests

[adminProducts.spec.ts](../tests/api/regression/adminProducts.spec.ts) reuses the same reference-data setup and covers:

- Creating a product with `name: ""` expects status 422; the rest of the request is generated with valid relation IDs.
- Retrieving a deleted product expects status 404. This test creates and deletes its own product before requesting its ID.

Errors are checked with `.rejects.toThrow()` including the method, URL, and status. The retrieval case adds its product ID to a cleanup set and removes it after successful deletion. `afterAll({ productsApi })` deletes any remaining recorded products; the shared fixture owns request-context disposal. The invalid creation case does not track IDs because the request is expected to fail.
