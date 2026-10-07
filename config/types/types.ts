export type EnvironmentName = "dev" | "stage" | "prod";

export type EnvironmentProject =
    | "chromium"
    | "firefox"
    | "webkit"
    | "mobile-chrome"
    | "mobile-safari";

export interface Environment {
    baseURL: string;
    baseApiURL: string;
    timeout: number;
    retries: number;
    projects: readonly EnvironmentProject[];
}
