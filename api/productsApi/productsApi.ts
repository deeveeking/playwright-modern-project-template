import { ApiRequestHelper } from "../../helpers/apiRequestHelper";
import type {
    CreateProductRequest,
    CreateProductResponse,
    DeleteProductResponse,
    GetProductResponse,
    GetProductsResponse,
} from "./types";

export class ProductsApi {
    public async getAll(): Promise<GetProductsResponse> {
        return ApiRequestHelper.executeApiRequest<GetProductsResponse, never>({
            url: "/products",
            method: "GET",
        });
    }

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

    public async delete(productId: string): Promise<DeleteProductResponse> {
        return ApiRequestHelper.executeApiRequest<DeleteProductResponse, never>({
            url: `/products/${encodeURIComponent(productId)}`,
            method: "DELETE",
        });
    }
}
