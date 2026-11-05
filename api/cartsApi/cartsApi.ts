import { ApiRequestHelper } from "../../helpers/apiRequestHelper";

export class CartsApi {
    public async delete(cartId: string): Promise<void> {
        return ApiRequestHelper.executeApiRequest<void, never>({
            url: `/carts/${encodeURIComponent(cartId)}`,
            method: "DELETE",
        });
    }
}
