import { expect, test } from 'vitest';
import { mockInquirer, useTempDir } from 'test-utils';
import { useDefaultConfigFile } from './helpers.js';

const TEMP_DIR = useTempDir();

const CONFIG_FILE_PATH = useDefaultConfigFile({
	tempDir: TEMP_DIR,
});

test('Test CLI mock throws error if no name specified', async () => {

	// Mock Inquirer to skip the prompt for the recording name
	await mockInquirer({
		response: {
			name: undefined,
		},
	});

	const playhar = await import('../src/playhar.js');
	const { run } = await import('../src/bridge');

	// Run mock without specifying a name (and with inquirer mocked to return undefined), to force the error
	try {
		await run(['node', 'playhar', 'mock', '--config', CONFIG_FILE_PATH()]);
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(playhar.errors.PlayharErrorRecordingNameRequired);
	}

});
