# Carts API

`api/cartsApi/cartsApi.ts` exports `CartsApi`. The worker-scoped `cartsApi` fixture in `fixtures/apiFixture.ts` creates it directly. It uses the shared `ApiRequestHelper` for the configured API base URL, admin authentication, logging, and error handling.

## Methods

| Method | HTTP request | Parameter | Result |
| --- | --- | --- | --- |
| `delete(cartId)` | `DELETE /carts/{cartId}` | Cart ID as a string, encoded in the URL. | `Promise<void>`; successful deletion returns HTTP 204. |

The client currently provides deletion for UI test-data cleanup. Unsuccessful HTTP responses throw the existing helper error containing the method, URL, and status. No request-body interface is needed for this path parameter.

## Product Fixture Cleanup

Product and cart UI specs import `test` and `expect` from `fixtures/productFixture.ts`. Its `products` fixture:

1. Creates the number of products selected by `productCount`.
2. Provides the prepared array to the test, or its first item through `product`.
3. Reads the current page's `sessionStorage["cart_id"]` during teardown.
4. Deletes that cart through `cartsApi` when an ID is present.
5. Deletes the prepared products through `productsApi`.

Tests create and populate their cart through the UI. Deleting the cart before products clears its item references. The fixture keeps its page alive through cleanup and uses `finally` to run teardown after assertion failures or partial product setup. The existing user fixture owns user deletion, and `_apiLifecycle` disposes the shared HTTP context at worker teardown.

See [UI Product Data](./fixtures.md#ui-product-data), [Products API](./products-api.md), and the [cart regression spec](../tests/ui/regression/cartFlow.spec.ts).
