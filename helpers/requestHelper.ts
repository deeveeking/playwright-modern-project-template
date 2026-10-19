import { faker } from "@faker-js/faker";
import type { CreateCategoryRequest } from "../api/categoryApi/types";
import type { CreateProductRequest } from "../api/productsApi/types";
import type { RegisterUserRequest, SearchUserRequest } from "../api/userApi/types";

export const getRegisterUserRequest = (): RegisterUserRequest => {
    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email({ firstName: faker.string.uuid(), provider: "example.com" }),
        password: faker.internet.password({ length: 12, prefix: "Aa1!" }),
        address: {
            street: faker.location.street(),
            house_number: faker.location.buildingNumber(),
            city: faker.location.city(),
            state: faker.location.state(),
            country: faker.location.countryCode(),
            postal_code: faker.location.zipCode(),
        },
        phone: faker.string.numeric({ length: 12, allowLeadingZeros: false }),
        dob: faker.date.birthdate({ min: 18, max: 65, mode: "age" }).toISOString().split("T")[0],
    };
};

export const getSearchUserRequest = (q: string, page: number = 1): SearchUserRequest => {
    return {
        q,
        page,
    };
};

export const getCreateCategoryRequest = (): CreateCategoryRequest => {
    return {
        name: `${faker.commerce.department()} ${faker.string.uuid()}`,
        slug: `category-${faker.string.uuid()}`,
        parent_id: null,
    };
};

export const getCreateProductRequest = (
    categoryId: string,
    brandId: string,
    productImageId: string
): CreateProductRequest => {
    return {
        name: `${faker.commerce.productName()} ${faker.string.uuid()}`,
        description: faker.commerce.productDescription(),
        price: faker.number.int({ min: 100, max: 100000 }) / 100,
        category_id: categoryId,
        brand_id: brandId,
        product_image_id: productImageId,
        is_location_offer: faker.datatype.boolean(),
        is_rental: faker.datatype.boolean(),
        co2_rating: faker.helpers.arrayElement(["A", "B", "C", "D", "E"]),
        stock: faker.number.int({ min: 1, max: 100 }),
    };
};
