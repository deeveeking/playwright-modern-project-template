import { middleWaitTimeout } from "../../constants/default";
import { Environment } from "../types/types";

export const stageConfig: Environment = {
    baseURL: "",
    baseApiURL: "https://staging.reqres.in",
    timeout: middleWaitTimeout,
    retries: 0,
    projects: ["chromium", "firefox", "webkit", "mobile-chrome", "mobile-safari"],
};
