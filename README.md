# i18n-csv-generator

## Description

This is a simple tool to generate i18n csv files from a given directory.

## Usage

```bash
$ npm i i18n-csv-generator
$ npm exec i18n-csv-generator init # Generates a configuration file
$ npm exec i18n-csv-generator generate # Generates the locale files
```

## Configuration

The configuration file is a JSON file named `i18n-csv-generator.json` at the root of your project.

```jsonc
{
    "csvFile": "./src/i18n/locale.csv", // The path to the csv file
    "delimiter": ",", // The delimiter used in the csv file
    "generateAt": "./src/i18n/locales", // The path where the locale files will be generated
    "offset": 0, // The offset of the csv file, will jump columns
}
```