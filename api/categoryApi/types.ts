export interface CategoryResponse {
    id: string;
    parent_id: string | null;
    name: string;
    slug: string;
    sub_categories?: CategoryResponse[];
}

// Swagger's CategoryRequest schema does not declare required fields.
// The API validates the payload when the request is sent.
export interface CreateCategoryRequest {
    name?: string;
    slug?: string;
    parent_id?: string | null;
}

export interface CreateCategoryResponse extends CategoryResponse {}

export interface GetCategoryResponse extends CategoryResponse {
    sub_categories: CategoryResponse[];
}
