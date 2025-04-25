import { expect, test } from 'vitest';
import fs from 'fs';
import { useTempDir } from '@adameisfeld/test-utils';
import path from 'path';
import { mockAnyRecording, useDefaultConfigFile } from './helpers.js';

const TEMP_DIR = useTempDir();

test('mock throws if no config specified and no default config found', async () => {

	// Setup constants
	const RECORDING_NAME = 'test-recording';

	// Mock any recording, we aren't using the contents of the recording for this test, we just need it setup to allow record() to work
	await mockAnyRecording({
		recordingName: RECORDING_NAME,
		tempDir: TEMP_DIR,
	});
	
	const playhar = await import('../src/playhar.js');

	// Create a playhar config
	const config = playhar.defineConfig({
		directory: TEMP_DIR(),
		baseRequestUrl: 'https://api.example.com',
		extractions: [
			{
				type: 'regex',
				property: 'SECRET_TOKEN',
				search: '\\\\\"token\\\\\":\\\\\"[^\"]*\\\\\"',
				replace: '\\\"token\\\":\\\"{{ property }}\\\"'
			}
		],
	});

	// Run record, which will skip recording and use the mock har file, then process the recording as usual
	await playhar.record({
		config,
		name: RECORDING_NAME,
		url: 'https://example.com/',
	});

	// Run mock, but don't pass config. This should attempt to read in the default config file but fail because it doesn't exist.
	try {
		const outputFilePath = path.join(TEMP_DIR(), 'mocked.har');
		await playhar.mock({
			name: RECORDING_NAME,
			injections: undefined,
			toHarFile: outputFilePath,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		const instanceType = error.constructor.name;
		expect(error).toBeInstanceOf(playhar.errors.PlayharErrorConfigFileNotFound);
	}
	
});
