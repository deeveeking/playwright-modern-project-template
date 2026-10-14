import { CategoryApi } from "./categoryApi/categoryApi";
import { ProductsApi } from "./productsApi/productsApi";
import { UserApi } from "./userApi/userApi";

export class ApiFactory {
    private constructor() {}

    public static get userApi(): UserApi {
        return new UserApi();
    }

    public static get productsApi(): ProductsApi {
        return new ProductsApi();
    }

    public static get categoryApi(): CategoryApi {
        return new CategoryApi();
    }
}
