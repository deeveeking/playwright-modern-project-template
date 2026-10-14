import { ApiRequestHelper } from "../../helpers/apiRequestHelper";
import type {
    CreateCategoryRequest,
    CreateCategoryResponse,
    GetCategoryResponse,
} from "./types";

export class CategoryApi {
    public async create(body: CreateCategoryRequest): Promise<CreateCategoryResponse> {
        return ApiRequestHelper.executeApiRequest<CreateCategoryResponse, CreateCategoryRequest>({
            url: "/categories",
            method: "POST",
            body,
        });
    }

    public async getById(categoryId: string): Promise<GetCategoryResponse> {
        return ApiRequestHelper.executeApiRequest<GetCategoryResponse, never>({
            url: `/categories/tree/${encodeURIComponent(categoryId)}`,
            method: "GET",
        });
    }
}
