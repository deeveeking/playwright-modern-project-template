import { middleWaitTimeout } from "../../constants/default";
import { Environment } from "../types/types";

export const stageConfig: Environment = {
    baseURL: "https://www.stage.automationexercise.com/", // Invalid test URL; placeholder only.
    baseApiURL: "https://api.practicesoftwaretesting.com",
    timeout: middleWaitTimeout,
    retries: 0,
    projects: ["chromium", "firefox", "webkit", "mobile-chrome", "mobile-safari"],
};
