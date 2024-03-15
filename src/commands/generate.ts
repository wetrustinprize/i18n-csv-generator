import fs from 'fs';
import path from 'path';
import CsvReadableStream, { DataTypes } from 'csv-reader';
import { fixNaming, setValue } from '../utils';
import config from '../config';

const generate = () => {
    const configExists = fs.existsSync('./i18n-csv-generator.config.json');

    if (!configExists) {
        console.log('Config file doesn\'t exists.');
        return;
    }

    let languages: string[] = [];
    let keys: string[] = [];

    let translations: { [locale: string]: { [key: string]: string; }; } = {};
    let translationsHelp: { [locale: string]: string[] } = {};

    let currentLine = 0;

    let missingValues: { [locale: string]: string[]; } = {};

    console.info(`Reading CSV file: ${config.csvFile}`);

    const csvStream = fs.createReadStream(config.csvFile, 'utf-8');
    csvStream
        .pipe(new CsvReadableStream({ delimiter: config.delimiter }))
        .on('header', function (header) {
            const headerDisplaced = header.slice(config.offset + 1);
            languages = headerDisplaced as string[];

            const duplicatedLanguages = languages.filter((language, index) => languages.indexOf(language) !== index);
            if (duplicatedLanguages.length > 0) {
                console.error(`There are duplicated languages: ${duplicatedLanguages.join(', ')}`);
                process.exit(1);
            }
        })
        .on('data', function (row) {
            const rowsDisplaced = (row as DataTypes[]).slice(config.offset);

            // Skip header
            if (currentLine === 0) {
                currentLine++;
                return;
            }

            // Skip empty lines
            const key = (rowsDisplaced[0])?.toString();
            if (!key) {
                console.warn(`Key is empty on line ${currentLine}, skipping...`);
                currentLine++;
                return;
            };

            // Check duplicates
            if (keys.includes(key)) {
                console.error(`There are duplicated keys. ${currentLine}, key: ${key}`);
                process.exit(1);
            }

            languages.forEach((language, index) => {
                // Sanity check for language
                if (translations[language] === undefined)
                    translations[language] = {};

                // Sanity check for index
                if (index > rowsDisplaced.length) {
                    console.warn(`There are less values than languages on line ${currentLine} (key: ${key}, lang: ${language}), skipping...`);
                    return;
                }

                let value = rowsDisplaced[index + 1];

                // No translation for this language
                if (!value) {
                    if (missingValues[language] === undefined)
                        missingValues[language] = [];

                    missingValues[language]!.push(key);
                    return;
                }

                translations[language]![key] = value.toString();
            });

            currentLine++;
        })
        .on('end', function () {
            console.info(`CSV file readed. ${currentLine} lines readed.`);
            console.info(`Total languages: ${languages.join(", ")} (${languages.length})`);
            console.info(`Total keys: ${Object.keys(keys).length}`)

            const totalTranslations = Object.keys(keys).length * languages.length;
            const totalTranslated = Object.keys(translations).reduce((total, language) => total + Object.keys(translations[language] || {}).length, 0);
            const isMissingTranslations = totalTranslated < totalTranslations;

            if (isMissingTranslations)
                console.warn(`There are ${totalTranslations - totalTranslated} translations missing.`);
            else
                console.info(`All translations are present. (${totalTranslations})`);

            Object.keys(missingValues).forEach((language) => {
                console.warn(`Missing translations for ${language}: ${missingValues[language]?.length}`);
            });

            console.info('Generating files...');

            const translationPaths: { [locale: string]: string } = {};

            // Generate translation files
            Object.keys(translations).forEach((language) => {
                const keys = Object.keys(translations[language] || {});

                if (keys.length === 0) {
                    console.warn(`Skipping ${language} because there are no translations.`);
                    return;
                }

                const finalTranslationObject = {};
                keys.forEach((key) => {
                    setValue(finalTranslationObject, key, translations[language]![key]);
                });

                const finalTranslationFileData = "".concat(
                    "// This file is auto-generated. Do not edit it.\n",
                    "\n",
                    "export default ",
                    JSON.stringify(finalTranslationObject, null, 4),
                    ";",
                );

                const finalPath = path.join(config.generateAt, `${language}.${config.extension}`);
                fs.writeFileSync(finalPath, finalTranslationFileData, 'utf-8');

                translationPaths[language] = finalPath;
            });

            // Generate index file
            const indexFileData = "".concat(
                "// This file is auto-generated. Do not edit it.\n",
                "\n",
                Object.keys(translationPaths).map((language) => {
                    return `import ${fixNaming(language)} from './${language}.${config.extension}';`;
                }).join('\n'),
                "\n",
                "\n",
                "export default {",
                "\n",
                Object.keys(translationPaths).map((language) => {
                    const text = "".concat(
                        `    '${language}': {`,
                        `\n`,
                        `       translation: ${fixNaming(language)},`,
                        `\n`,
                        `   },`,
                    );

                    return text;

                }).join('\n'),
                "\n",
                "};",
            );

            const indexPath = path.join(config.generateAt, `index.${config.extension}`);
            fs.writeFileSync(indexPath, indexFileData, 'utf-8');
        });

};

export default generate;