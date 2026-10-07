import { middleWaitTimeout } from "../../constants/default";
import { Environment } from "../types/types";

export const devConfig: Environment = {
    baseURL: "",
    baseApiURL: "https://reqres.in",
    timeout: middleWaitTimeout,
    retries: 0,
    projects: ["chromium"],
}
