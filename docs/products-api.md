# Products API and API Factory

`api/apiFactory.ts` exports `ApiFactory`, which creates API clients:

```ts
import { ApiFactory } from "../api/apiFactory";

const userApi = ApiFactory.userApi;
const productsApi = ApiFactory.productsApi;
const categoryApi = ApiFactory.categoryApi;
```

Each getter access creates a new client. Clients share the static `ApiRequestHelper` context and token; creating a client does not create a separate authenticated session.

The API modules export their classes so the factory can import them. Its typed static getters create instances directly with `new UserApi()`, `new ProductsApi()`, and `new CategoryApi()`. Use the getters without parentheses to obtain clients in tests. See [Category API](./category-api.md) for category methods.

## Product Methods

`ProductsApi` is implemented in `api/productsApi/productsApi.ts` and obtained through the factory. Its request and response interfaces live in `api/productsApi/types.ts`, based on the [Product Swagger documentation](https://api.practicesoftwaretesting.com/api/documentation#/Product).

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
import { ApiFactory } from "../api/apiFactory";
import { ApiRequestHelper } from "../helpers/apiRequestHelper";
import type { CreateProductRequest } from "../api/productsApi/types";

const productsApi = ApiFactory.productsApi;
const payload: CreateProductRequest = {
    name: "Test hammer",
    description: "A hammer created for an API test",
    price: 19.99,
    category_id: "replace-with-existing-category-id",
    brand_id: "replace-with-existing-brand-id",
    product_image_id: "replace-with-existing-image-id",
    is_location_offer: false,
    is_rental: false,
    co2_rating: "A",
    stock: 10,
};

let createdProductId: string | undefined;
try {
    const created = await productsApi.create(payload);
    createdProductId = created.id;
    const product = await productsApi.getById(created.id);
} finally {
    try {
        if (createdProductId) {
            await productsApi.delete(createdProductId);
        }
    } finally {
        await ApiRequestHelper.dispose();
    }
}
```

## Admin Product Smoke Tests

[`adminProducts.spec.ts`](../tests/api/smoke/adminProducts.spec.ts) contains two independent tests:

- `Admin is create product successfuly with correct data` generates a request, creates a product, and compares the complete creation response with `expectedResponse` using `toEqual()`.
- `Admin is get product by id successfuly` creates a separate product, retrieves it by ID, and compares the exact ID, submitted fields, related objects, and empty `specs` array with its expected response.

`beforeAll` creates the client through `ApiFactory.productsApi`, reads the first product page, and retrieves an existing product for valid category, brand, and image references. The selected environment must already contain a product with these relations. Reference products are read only and never scheduled for deletion.

Reusing reference data keeps this architecture example simple. Related data could instead be prepared before each test. The generator requires the three IDs as arguments; they are not hardcoded or read from environment configs. Setup directly accesses `products.data[0]` without a separate list-length assertion.

`getCreateProductRequest(categoryId, brandId, productImageId)` in `helpers/requestHelper.ts` uses Faker for a name with a UUID, description, positive two-decimal price, booleans, CO2 rating, and positive stock quantity. Existing relation IDs are passed in rather than randomly generated. The tests derive `is_eco_friendly` from rating A or B and expect admin `in_stock` to equal the submitted stock.

Each test records its created product ID before asserting the response. `afterAll` deletes the recorded products with `Promise.all`, then disposes the context. If a deletion rejects, the hook fails before reaching `dispose()`.

```bash
npx playwright test tests/api/smoke/adminProducts.spec.ts --project=api
```

## Admin Product Regression Tests

[adminProducts.spec.ts](../tests/api/regression/adminProducts.spec.ts) reuses the same reference-data setup and covers:

- Creating a product with `name: ""` expects status 422; the rest of the request is generated with valid relation IDs.
- Retrieving a deleted product expects status 404. This test creates and deletes its own product before requesting its ID.

Errors are checked with `.rejects.toThrow()` including the method, URL, and status. The retrieval case adds its product ID to a cleanup set and removes it after successful deletion. `afterAll` deletes any remaining recorded products, then disposes the request context. The invalid creation case does not track IDs because the request is expected to fail.
