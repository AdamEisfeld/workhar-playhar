import { expect, test } from 'vitest';
import { useTempDir } from 'test-utils';
import { mockAnyRecording, useDefaultConfigFile } from './helpers.js';

const TEMP_DIR = useTempDir();

useDefaultConfigFile({
	tempDir: TEMP_DIR,
});

test('record throws if recorded .har not found', async () => {

	// Setup constants
	const RECORDING_NAME = 'test-recording';

	// Mock any recording, we aren't using the contents of the recording for this test, we just need it setup to allow record() to work
	await mockAnyRecording({
		recordingName: RECORDING_NAME,
		tempDir: TEMP_DIR,
	});

	const playhar = await import('../src/playhar.js');

	// Run record, but don't pass config. This should attempt to read in the default config file.
	try {
		await playhar.record({
			name: 'nonexistent-recording',
			url: 'http://localhost:5173',
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(playhar.errors.PlayharErrorRecordingFileNotFound);
	}

});
