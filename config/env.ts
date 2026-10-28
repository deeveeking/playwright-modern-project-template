import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { devConfig } from "./environments/dev";
import { prodConfig } from "./environments/prod";
import { stageConfig } from "./environments/stage";
import {
    supportedBrowserProjects,
    Environment,
    EnvironmentName,
} from "./types/types";

const envFilePath = resolve(__dirname, "../.env");

if (existsSync(envFilePath)) {
    loadEnvFile(envFilePath);
}

const environments: Record<EnvironmentName, Environment> = {
    dev: devConfig,
    stage: stageConfig,
    prod: prodConfig,
};

export const getEnvironment = (): Environment => {
    const environmentName = process.env.TEST_ENV || "dev";
    const headless = process.env.CI ? "false" : process.env.HEADLESS;
    const browserName = process.env.TEST_BROWSER?.trim();

    if (environmentName in environments) {
        const environment = environments[environmentName as EnvironmentName];
        const browserProject = supportedBrowserProjects.find(
            project => project === browserName
        );

        if (browserName && !browserProject) {
            throw new Error(
                `Invalid TEST_BROWSER: ${browserName}. Available browsers: ${supportedBrowserProjects.join(", ")}`
            );
        }

        return {
            ...environment,
            projects: browserProject ? [browserProject] : environment.projects,
            headless: headless
                ? headless === "true"
                : environment.headless,
        };
    }

    throw new Error(
        `Invalid TEST_ENV: ${environmentName}. Available environments: ${Object.keys(environments).join(", ")}`
    );
};
