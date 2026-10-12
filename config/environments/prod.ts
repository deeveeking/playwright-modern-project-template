import { Environment } from "../types/types";

export const prodConfig: Environment = {
    baseURL: "https://www.automationexercise.com/",
    baseApiURL: "https://api.practicesoftwaretesting.com",
    timeout: 0,
    retries: 0,
    projects: ["chromium", "webkit", "mobile-chrome", "mobile-safari"],
};
