import { middleWaitTimeout } from "../../constants/default";
import { Environment } from "../types/types";

export const devConfig: Environment = {
    baseURL: "https://dev.practicesoftwaretesting.com/", // Fake URL for illustration only.
    baseApiURL: "http://localhost:8091",
    timeout: middleWaitTimeout,
    retries: 0,
    projects: ["chromium"],
};
