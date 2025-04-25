import { test } from 'vitest';
import { useTempDir } from '@adameisfeld/test-utils';
import { mockAnyRecording, useDefaultConfigFile } from './helpers.js';
import path from 'path';

const TEMP_DIR = useTempDir();

useDefaultConfigFile({
	tempDir: TEMP_DIR,
});

test('Test CLI mock uses default config if not specified', async () => {

	// Setup constants
	const RECORDING_NAME = 'test-recording';

	// Mock any recording, we aren't using the contents of the recording for this test, we just need it setup to allow record() to work
	await mockAnyRecording({
		recordingName: RECORDING_NAME,
		tempDir: TEMP_DIR,
	});

	const { run } = await import('../src/bridge');

	// Run the record CLI command
	await run(['node', 'playhar', 'record']);

	// Run the mock CLI command to create a mocked HAR file
	const outputFilePath = path.join(TEMP_DIR(), 'mocked.har');
	await run(['node', 'playhar', 'mock', '--name', RECORDING_NAME, '--out', outputFilePath]);

});
