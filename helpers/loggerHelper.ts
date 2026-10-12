import pino from "pino";
import pinoHttp from "pino-http";

// Configure the main logger instance for general app logging
const logger = pino({
    level: "info", // Default logging level
    transport: { // Configuration logs to console
        target: "pino-pretty",
        options: {
            destination: 1, // Output to stdout
            colorize: true, // Enable colorful output in console
            levelFirst: true, // Show log level before message
            messageFormat: "{msg}", // Format the log message
            ignore: "pid,hostname", // Exclude process ID and hostname
            customColors: "error:red,warn:yellow,info:green,debug:blue,trace:magenta",
        },
    },
});

// Configure an HTTP logger instance for logging incoming HTTP requests/responses
const httpLogger = pinoHttp({
    logger, // Use the main logger instance
    customLogLevel: (_req, res, err) => { // Get log level based on HTTP response
        if (res.statusCode && res.statusCode >= 400 && res.statusCode < 500)
            return "warn"; // Client errors are warnings
        if ((res.statusCode && res.statusCode >= 500) || err)
            return "error"; // Server errors or exceptions are errors
        return "info"; // All other successful requests are info
    },
});

export { logger, httpLogger };
