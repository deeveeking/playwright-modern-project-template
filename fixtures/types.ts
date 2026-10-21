import type { CategoryApi } from "../api/categoryApi/categoryApi";
import type { ProductsApi } from "../api/productsApi/productsApi";
import type { UserApi } from "../api/userApi/userApi";
import type {
    LoginUserRequest,
    RegisterUserResponse,
} from "../api/userApi/types";

export interface TestUser {
    credentials: LoginUserRequest;
    profile?: RegisterUserResponse;
    cleanup: () => Promise<void>;
}

export interface ApiFixtures {
    userApi: UserApi;
    productsApi: ProductsApi;
    categoryApi: CategoryApi;
}

export interface ApiWorkerFixtures extends ApiFixtures {
    _apiLifecycle: void;
}

export interface UserOptions {
    userCredentials: LoginUserRequest | undefined;
}

export interface UserFixtures {
    user: TestUser;
}
