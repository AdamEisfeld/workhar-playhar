import { expect, test } from 'vitest';
import { useTempDir } from '@adameisfeld/test-utils';
import { mockAnyRecording, useDefaultConfigFile } from './helpers.js';

const TEMP_DIR = useTempDir();

useDefaultConfigFile({
	tempDir: TEMP_DIR,
});

test('mock uses temporary .har file if no output specified', async () => {

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
		prepare: async (page) => {
			await page.goto('https://example.com/');
		},
	});

	// Run the mock command to create a mocked HAR file
	const tempHar = await playhar.mock({
		name: RECORDING_NAME,
		injections: undefined,
	});

	// Ensure the file ends in temp.har
	expect(tempHar.endsWith('temp.har')).toBe(true);
	
});
