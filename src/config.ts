import fs from "fs";
require('better-logging')(console);
import { InferType, ValidationError, boolean, object, string, number } from "yup";

const configFile = JSON.parse(fs.readFileSync('./i18n-csv-generator.config.json', 'utf-8'));

const configSchema = object({
    "csvFile": string().required(),
    "delimiter": string().required(),
    "generateAt": string().required(),

    "offset": number().positive().default(0),
    "extension": string().default("ts").oneOf(["ts", "js"]),
});

type Config = InferType<typeof configSchema>;

let config: Config = {} as any;

try {
    config = configSchema.validateSync(configFile);
} catch (error) {
    if (error instanceof ValidationError) {
        console.error("Validation error in config file:")
        console.error(error.message);
        process.exit(1);
    }
    else
        throw error;
}

export default config;