import { Environment } from "../types/types";

export const prodConfig: Environment = {
    baseURL: "",
    baseApiURL: "https://reqres.in",
    timeout: 0,
    retries: 0,
    projects: ["chromium", "webkit", "mobile-chrome", "mobile-safari"],
};
