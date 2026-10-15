import { faker } from "@faker-js/faker";
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
