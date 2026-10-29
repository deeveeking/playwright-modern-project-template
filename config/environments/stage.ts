import { middleWaitTimeout } from "../../constants/default";
import { Environment } from "../types/types";

export const stageConfig: Environment = {
    baseURL: "https://stage.practicesoftwaretesting.com/", // Fake URL for illustration only.
    baseApiURL: "https://api.practicesoftwaretesting.com",
    timeout: middleWaitTimeout,
    retries: 0,
    projects: ["chromium", "firefox", "webkit", "mobile-chrome", "mobile-safari"],
};
