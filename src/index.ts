#!/usr/bin/env node
require('better-logging')(console);

import yargs from 'yargs';

import { hideBin } from 'yargs/helpers';
import init from './commands/init';
import generate from './commands/generate';

yargs(hideBin(process.argv))
    .scriptName('i18n-csv-generator')
    .command('init', 'Initialize the default config file', () => init())
    .command('generate', 'Generate CSV files and help from the config file', () => generate())
    .parse();
