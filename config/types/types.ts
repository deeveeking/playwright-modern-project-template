export type EnvironmentName = "dev" | "stage" | "prod";

export const supportedBrowserProjects = [
    "chromium",
    "firefox",
    "webkit",
    "mobile-chrome",
    "mobile-safari",
] as const;

export type EnvironmentProject =
    (typeof supportedBrowserProjects)[number];

export interface Environment {
    baseURL: string;
    baseApiURL: string;
    timeout: number;
    retries: number;
    projects: readonly EnvironmentProject[];
}

export interface ResolvedEnvironment extends Environment {
    headless: boolean;
}
