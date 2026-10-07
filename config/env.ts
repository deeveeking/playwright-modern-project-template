import { devConfig } from "./environments/dev";
import { prodConfig } from "./environments/prod";
import { stageConfig } from "./environments/stage";
import { Environment, EnvironmentName } from "./types/types";

const environments: Record<EnvironmentName, Environment> = {
    dev: devConfig,
    stage: stageConfig,
    prod: prodConfig,
};

export const getEnvironment = (): Environment => {
    const environmentName = process.env.TEST_ENV;

    if (!environmentName) {
        return environments.dev;
    }

    if (environmentName in environments) {
        return environments[environmentName as EnvironmentName];
    }

    throw new Error(
        `Invalid TEST_ENV: ${environmentName}. Available environments: ${Object.keys(environments).join(", ")}`
    );
};
