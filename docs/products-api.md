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
| `create(body)` | `POST /products` | `CreateProductRequest` (JSON body) | `CreateProductResponse` |
| `getById(productId)` | `GET /products/{productId}` | `productId: string` (path parameter) | `GetProductResponse` |

The creation payload includes `name`, `description`, `price`, `category_id`, `brand_id`, `product_image_id`, `is_location_offer`, `is_rental`, and `co2_rating`. Swagger does not mark request fields as required, so the interface leaves them optional; server validation still applies. Supply existing category, brand, and image IDs from the selected environment.

Responses describe the product and optional related brand, category, and image objects. These TypeScript interfaces do not perform runtime validation. Non-successful responses are handled by `ApiRequestHelper` and throw an error.

## Example

Set `API_EMAIL` and `API_PASSWORD` as described in [Environment Config](./environment-config.md#current-environment). The helper attaches a token to both product requests.

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
};

try {
    const created = await productsApi.create(payload);
    const product = await productsApi.getById(created.id);
} finally {
    await ApiRequestHelper.dispose();
}
```
