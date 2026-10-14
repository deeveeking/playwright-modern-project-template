export interface ProductBrandResponse {
    id: string;
    name: string;
    slug: string;
}

export interface ProductCategoryResponse {
    id: string;
    parent_id: string | null;
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
    in_stock?: boolean;
    co2_rating?: string;
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
}

export interface CreateProductResponse extends ProductResponse {}

export interface GetProductResponse extends ProductResponse {}
