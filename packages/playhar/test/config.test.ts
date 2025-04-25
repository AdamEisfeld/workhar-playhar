import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as playhar from '../src/playhar';
import { useTempDir } from 'test-utils';

const TEMP_DIR = useTempDir();

test('configFromFile .json', async () => {

	// Create a playhar config
	const config: playhar.types.PlayharConfig = playhar.defineConfig({
		directory: TEMP_DIR(),
		baseRecordingUrl: 'https://example.com/record-config-json',
		baseRequestUrl: 'https://api.example.com',
		extractions: [],
	});

	// Write the config
	const configFilePath = path.join(TEMP_DIR(), 'config.json');
	fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf-8');

	const configFromFile = await playhar.configFromFile({
		file: configFilePath,
		fallbacks: []
	});

	// Verify the config
	expect(configFromFile).toEqual(config);
});

test('configFromFile .js', async () => {

	// Create a playhar config
	const config: playhar.types.PlayharConfig = playhar.defineConfig({
		directory: TEMP_DIR(),
		baseRecordingUrl: 'https://example.com/record-config-js',
		baseRequestUrl: 'https://api.example.com',
		extractions: [],
	});

	// Write the config
	const configFilePath = path.join(TEMP_DIR(), 'config.js');
	fs.writeFileSync(configFilePath, `export default ${JSON.stringify(config, null, 2)}`, 'utf-8');

	const configFromFile = await playhar.configFromFile({
		file: configFilePath,
		fallbacks: []
	});

	// Verify the config
	expect(configFromFile).toEqual(config);
});

test('configFromFile .ts', async () => {

	// Create a playhar config
	const config: playhar.types.PlayharConfig = playhar.defineConfig({
		directory: TEMP_DIR(),
		baseRecordingUrl: 'https://example.com/record-config-ts',
		baseRequestUrl: 'https://api.example.com',
		extractions: [],
	});

	// Write the config
	const configFilePath = path.join(TEMP_DIR(), 'config.ts');
	fs.writeFileSync(configFilePath, `
		import { defineConfig } from 'playhar';
		export default defineConfig(${JSON.stringify(config, null, 2)})
	`, 'utf-8');

	const configFromFile = await playhar.configFromFile({
		file: configFilePath,
		fallbacks: []
	});

	// Verify the config
	expect(configFromFile).toEqual(config);

});

test('configFromFile with fallbacks .json', async () => {

	// Create a playhar config
	const config: playhar.types.PlayharConfig = playhar.defineConfig({
		directory: TEMP_DIR(),
		baseRecordingUrl: 'https://example.com/record-config-json',
		baseRequestUrl: 'https://api.example.com',
		extractions: [],
	});

	// Write the default .json config file
	const fallbackPath = path.join(TEMP_DIR(), 'default.json');
	fs.writeFileSync(fallbackPath, JSON.stringify(config, null, 2), 'utf-8');

	const configFromFile = await playhar.configFromFile({
		file: undefined,
		fallbacks: [
			fallbackPath,
		]
	});

	// Verify the config
	expect(configFromFile).toEqual(config);
});

test('configFromFile with no file or fallbacks returns undefined', async () => {

	const configFromFile = await playhar.configFromFile({
		file: undefined,
		fallbacks: []
	});

	// Verify the config
	expect(configFromFile).toBeUndefined();

});

test('configFromFile with invalid file returns undefined', async () => {

	const configFromFile = await playhar.configFromFile({
		file: 'invalid.json',
		fallbacks: []
	});

	// Verify the config
	expect(configFromFile).toBeUndefined();

});

test('configFromFile with invalid json throws error', async () => {

	const invalidJsonPath = path.join(TEMP_DIR(), 'invalid.json');
	fs.writeFileSync(invalidJsonPath, '{ invalid json', 'utf-8');

	try {
		await playhar.configFromFile({
			file: invalidJsonPath,
			fallbacks: []
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(playhar.errors.PlayharErrorConfigParseFailed);
	}

});
