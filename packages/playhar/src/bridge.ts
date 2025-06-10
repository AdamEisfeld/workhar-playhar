import { Command } from 'commander';
import inquirer from 'inquirer';
import * as playhar from './playhar.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const pkg = require('../package.json');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: CLI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const run = (argv: string[] = process.argv) => {

	return new Promise<void>((resolve, reject) => {

		const program = new Command();

		program
			.name('playhar')
			.description(pkg.description)
			.version(pkg.version);

		program
			.command('record')
			.description('Open a browser and record API interactions into a templated HAR file.')
			.option(
				'-c, --config <path>',
				'Path to the Playhar config file (default: ./playhar.config.ts)',
			)
			.option(
				'-n, --name <name>',
				'Name of the folder to save this HAR recording under (e.g., "login-flow")'
			)
			.option(
				'-u, --url <url>',
				'URL to open in the browser to start recording from',
			)
			.action(async (options: { config: string, name?: string, url?: string }) => {

				try {

					const { config: configFile } = options;

					const config = configFile ? await playhar.configFromFile({
						file: configFile,
						fallbacks: []
					}) : await playhar.defaultConfig();
					if (!config) {
						throw new playhar.errors.PlayharErrorConfigFileNotFound({
							configFilePath: configFile,
						});
					}
		
					const { name } = options?.name !== undefined ? options : await inquirer.prompt([
						{
							type: 'input',
							name: 'name',
							message: `Enter a name for this HAR recording folder (e.g., "login-flow", "signup-page"). It will be saved under: ${config.directory}`,
						}
					]);

					const { url } = options?.url !== undefined ? options : await inquirer.prompt([
						{
							type: 'input',
							name: 'url',
							message: `Enter the URL to open in the browser to start recording from (e.g., "https://example.com/")`,
						}
					]);

					if (!name || name.length === 0) {
						throw new playhar.errors.PlayharErrorRecordingNameRequired();
					}
			
					await playhar.record({
						config,
						name,
						prepare: async (page) => {
							await page.goto(url);
						},
					});
	
					resolve();

				} catch(error) {
					reject(error);
				}

			});

		program
			.command('mock')
			.description(
				'Rebuild a HAR file from JSON files and inject variables. Useful for mocking in tests.'
			)
			.option(
				'-c, --config <path>',
				'Path to the Playhar config file (default: ./playhar.config.ts)',
			)
			.option(
				'-n, --name <name>',
				'Name of the HAR recording folder to mock (e.g., "login-flow")'
			)
			.option(
				'-i, --injections <path>',
				'Path to a file defining variable replacements for mustache tokens'
			)
			.option(
				'-o, --out <path>',
				'Path to save the mocked HAR file (default: ./output.har)',
				'./output.har'
			)
			.action(async (options: { config: string, name?: string, injections?: string, out: string }) => {

				try {

					const { config: configFile, injections: injectionsFile, out: outFile } = options;

					const config = configFile ? await playhar.configFromFile({
						file: configFile,
						fallbacks: []
					}) : await playhar.defaultConfig();
					if (!config) {
						throw new playhar.errors.PlayharErrorConfigFileNotFound({
							configFilePath: configFile,
						});
					}

					const { name } = options?.name !== undefined ? options : await inquirer.prompt([
						{
							type: 'input',
							name: 'name',
							message: `Enter the name of an existing HAR recording folder in ${config.directory} to mock (e.g., "login-flow"):`,
						}
					]);

					if (!name || name.length === 0) {
						throw new playhar.errors.PlayharErrorRecordingNameRequired();
					}

					const injections = injectionsFile ? await playhar.injectionsFromFile({
						file: injectionsFile,
						fallbacks: [],
					}) : undefined;

					await playhar.mock({
						config,
						name,
						injections,
						toHarFile: outFile,
					});
	
					resolve();

				} catch(error) {
					reject(error);
				}


			});

		program.parse(argv);
		
	});

};
