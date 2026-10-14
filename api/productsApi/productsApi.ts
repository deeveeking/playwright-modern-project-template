import { ApiRequestHelper } from "../../helpers/apiRequestHelper";
import type {
    CreateProductRequest,
    CreateProductResponse,
    GetProductResponse,
} from "./types";

export class ProductsApi {
    public async create(body: CreateProductRequest): Promise<CreateProductResponse> {
        return ApiRequestHelper.executeApiRequest<CreateProductResponse, CreateProductRequest>({
            url: "/products",
            method: "POST",
            body,
        });
    }

    public async getById(productId: string): Promise<GetProductResponse> {
        return ApiRequestHelper.executeApiRequest<GetProductResponse, never>({
            url: `/products/${encodeURIComponent(productId)}`,
            method: "GET",
        });
    }
}
