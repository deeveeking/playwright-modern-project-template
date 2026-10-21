import { middleWaitTimeout } from "../../constants/default";
import { Environment } from "../types/types";

export const prodConfig: Environment = {
    baseURL: "https://practicesoftwaretesting.com/",
    baseApiURL: "https://api.practicesoftwaretesting.com",
    headless: true,
    timeout: middleWaitTimeout,
    retries: 0,
    projects: ["chromium", "webkit", "mobile-chrome", "mobile-safari"],
};
