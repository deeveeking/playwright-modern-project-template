import { middleWaitTimeout } from "../../constants/default";
import { Environment } from "../types/types";

export const devConfig: Environment = {
    baseURL: "https://www.dev.automationexercise.com/",
    baseApiURL: "http://localhost:8091",
    timeout: middleWaitTimeout,
    retries: 0,
    projects: ["chromium"],
}
