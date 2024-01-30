import fs from 'fs';
import defaultConfig from "../../public/default-config.json";

const defaultConfigAsString = JSON.stringify(defaultConfig, null, 4);

const init = () => {
    const fileExists = fs.existsSync('./i18n-csv-generator.config.json');

    if (fileExists) {
        console.log('Config file already exists.');
        return;
    }

    fs.writeFileSync('./i18n-csv-generator.config.json', defaultConfigAsString);
};

export default init;