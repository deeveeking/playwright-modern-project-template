export interface ProductBrandResponse {
    id: string;
    name: string;
    slug?: string;
}

export interface ProductCategoryResponse {
    id: string;
    parent_id?: string | null;
    name: string;
    slug: string;
    sub_categories?: ProductCategoryResponse[];
}

export interface ProductImageResponse {
    id: string;
    by_name: string;
    by_url: string;
    source_name: string;
    source_url: string;
    file_name: string;
    title: string;
}

export interface ProductResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    is_location_offer?: boolean;
    is_rental?: boolean;
    in_stock?: boolean | number | null;
    co2_rating?: string | null;
    is_eco_friendly?: boolean;
    brand?: ProductBrandResponse;
    category?: ProductCategoryResponse;
    product_image?: ProductImageResponse;
}

// Swagger's ProductRequest schema does not declare required fields.
// The API validates the payload when the request is sent.
export interface CreateProductRequest {
    name?: string;
    description?: string;
    price?: number;
    category_id?: string;
    brand_id?: string;
    product_image_id?: string;
    is_location_offer?: boolean;
    is_rental?: boolean;
    co2_rating?: string;
    stock?: number;
}

export interface CreateProductResponse extends ProductResponse {
    brand: ProductBrandResponse & { slug: string };
    category: ProductCategoryResponse;
    product_image: ProductImageResponse;
}

export interface ProductSpecResponse {
    id: string;
    product_id: string;
    spec_name: string;
    spec_value: string;
    spec_unit: string | null;
}

export interface GetProductResponse extends ProductResponse {
    brand: Pick<ProductBrandResponse, "id" | "name">;
    category: ProductCategoryResponse;
    product_image: ProductImageResponse;
    specs: ProductSpecResponse[];
}

export interface GetProductsResponse {
    current_page: number;
    data: ProductResponse[];
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
}

export type DeleteProductResponse = void;
