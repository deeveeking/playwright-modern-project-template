import { middleWaitTimeout } from "../../constants/default";
import { Environment } from "../types/types";

export const devConfig: Environment = {
    baseURL: "http://localhost:4200",
    baseApiURL: "http://localhost:8091",
    timeout: middleWaitTimeout,
    retries: 0,
    projects: ["chromium", "webkit", "mobile-chrome", "mobile-safari"],
};
