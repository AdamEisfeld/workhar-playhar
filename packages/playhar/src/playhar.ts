import * as mustachr from 'mustachr';
import * as workhar from 'workhar';
import { chromium } from '@playwright/test';
import fs from 'fs';
import * as types from './types.js';
import * as utils from './utils.js';
import * as errors from './errors.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Config
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Defines a Playhar configuration object with strongly typed validation.
 * Useful for authoring `.ts`, `.js`, or `.json` config files via `defineConfig(...)`.
 *
 * @param config - The configuration object for Playhar.
 * @returns The same configuration, validated and inferred as PlayharConfig.
 */
export const defineConfig = (config: types.PlayharConfig): types.PlayharConfig => {
	return config;
};

/**
 * Loads and parses a Playhar configuration file from disk.
 * Supports `.ts`, `.js`, or `.json` files, and attempts to resolve fallback paths if none is provided.
 *
 * @param file - Optional specific path to a config file.
 * @param fallbacks - Fallback file paths to try if `file` is not provided.
 * @returns The parsed PlayharConfig or `undefined` if no file was found.
 *
 * @throws PlayharErrorConfigParseFailed if the file exists but is invalid.
 */
export const configFromFile = async (options: {
	file?: string | undefined,
	fallbacks: string[],
}): Promise<types.PlayharConfig | undefined> => {

	const filePath = options.file || mustachr.utils._firstFoundPath(options.fallbacks);
	if (!filePath) {
		return undefined;
	}

	if (!fs.existsSync(filePath)) {
		return undefined;
	}
	try {
		const config = await mustachr.utils._parseFileIntoSchema(filePath, types.PlayharConfigSchema);
		return config;
	} catch (error) {
		throw new errors.PlayharErrorConfigParseFailed({
			configFilePath: filePath,
			error,
		});
	}
};

/**
 * Loads the default Playhar configuration from a file, either playhar.config.ts, .js, or .json, in that order.
 *
 * @returns The parsed PlayharConfig.
 *
 * @throws PlayharErrorConfigFileNotFound if no config file was found.
 */
export const defaultConfig = async (): Promise<types.PlayharConfig> => {
	const config = await configFromFile({
		fallbacks: [
			'./playhar.config.ts',
			'./playhar.config.js',
			'./playhar.config.json'
		],
	});
	if (!config) {
		throw new errors.PlayharErrorConfigFileNotFound({
			configFilePath: './playhar.config.ts, .js, or .json',
		});
	}
	return config;
}

export const defineInjections = mustachr.defineInjections;
export const injectionsFromFile = mustachr.injectionsFromFile;
export const defineExtractions = mustachr.defineExtractions;
export const extractionsFromFile = mustachr.extractionsFromFile;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Record
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Launches a Playwright browser session and records all network traffic to a HAR file.
 * Replaces sensitive values using Mustachr extractions, then exports each HAR entry’s response body to a JSON file.
 * Finally, it creates a `.workhar` mapping file for easy mocking later.
 *
 * This function is interactive and pauses until the user finishes interacting with the page.
 *
 * @param config - The Playhar configuration object.
 * @param name - The name of the folder where the recording will be saved.
 * @returns Paths to the HAR file, JSON directory, and .workhar file.
 */
export const record = async (options: {
	config?: types.PlayharConfig,
	name: string,
}): Promise<{
	harFilePath: string,
	workharJsonDirectory: string,
	workharFilePath: string,
}> => {

	const config = options.config || await defaultConfig();

	const recordingDirectory = utils._getRecordingDirectory({
		config,
		name: options.name,
	});
	fs.mkdirSync(recordingDirectory, { recursive: true });

	const recordedHarFilePath = utils._getRecordingHarFilePath({
		recordingDirectory,
	});

	const recordedJsonDirectory = utils._getRecordingJsonDirectory({
		recordingDirectory,
	});

	const recordedWorkharFilePath = utils._getWorkharFilePath({
		recordingDirectory,
	});

	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext({
		recordHar: {
			path: recordedHarFilePath,
			content: 'embed',
			urlFilter: config.baseRequestUrl,
		}
	});

	const page = await context.newPage();
	await page.goto(config.baseRecordingUrl);
	await page.pause();

	await context.close();
	await browser.close();

	// Run extractions to replace sensitive or tweakable data with template variables
	if (!fs.existsSync(recordedHarFilePath)) {
		throw new errors.PlayharErrorRecordingFileNotFound({
			recordingDirectory,
			recordedHarFilePath,
		});
	}

	const extractionsInput = fs.readFileSync(recordedHarFilePath, 'utf-8');
	const extractedFileContents = await mustachr.extract({
		input: extractionsInput,
		extractions: config.extractions,
	});

	// Write the extracted HAR to a file
	fs.writeFileSync(recordedHarFilePath, extractedFileContents, 'utf-8');
	
	// Convert the HAR file to JSON
	await workhar.har2json({
		fromHarFile: recordedHarFilePath,
		toWorkharFile: recordedWorkharFilePath,
		withJsonDirectory: recordedJsonDirectory,
	});

	return {
		harFilePath: recordedHarFilePath,
		workharJsonDirectory: recordedJsonDirectory,
		workharFilePath: recordedWorkharFilePath,
	}

};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Mock
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Creates a new HAR file for mocking from previously recorded JSON files.
 * Optionally injects values into the file using Mustachr injections.
 *
 * This is useful in Playwright tests using `page.routeFromHAR()` to simulate API responses.
 *
 * @param config - The Playhar configuration object.
 * @param name - The name of the recorded folder to mock from.
 * @param injections - Optional Mustachr injections to apply.
 * @param toHarFile - Path where the mocked HAR file should be saved.
 * @returns The final path to the generated HAR file.
 */
export const mock = async (options: {
	config?: types.PlayharConfig,
	name: string,
	injections?: mustachr.types.MustachrInjections,
	toHarFile: string,
}): Promise<string> => {

	const {
		injections,
		toHarFile,
	} = options;

	const config = options.config || await defaultConfig();

	const recordingDirectory = utils._getRecordingDirectory({
		config,
		name: options.name,
	});

	const recordedJsonDirectory = utils._getRecordingJsonDirectory({
		recordingDirectory,
	});

	const workharFile = utils._getWorkharFilePath({
		recordingDirectory,
	});
	
	// Convert the recorded JSON files to a new HAR file at the specified location
	await workhar.json2har({
		fromWorkHarFile: workharFile,
		withJsonDirectory: recordedJsonDirectory,
		toHarFile: toHarFile,
	});

	let mutableHarContent = fs.readFileSync(toHarFile, 'utf-8');

	if (injections) {
		
		// Apply any injections to the HAR file
		mutableHarContent = mustachr.inject({
			input: mutableHarContent,
			injections,
		});

		// Save the updated HAR file
		fs.writeFileSync(toHarFile, mutableHarContent, 'utf-8');
	}

	return toHarFile;

};

export const mustachrErrors = mustachr.errors;
export const workharErrors = workhar.errors;

export const mustachrTypes = mustachr.types;
export const workharTypes = workhar.types;

export * as utils from './utils.js';
export * as types from './types.js';
export * as errors from './errors.js';