import { expect, test } from 'vitest';
import { mockInquirer, useTempDir } from '@adameisfeld/test-utils';
import { useDefaultConfigFile } from './helpers.js';

const TEMP_DIR = useTempDir();

const CONFIG_FILE_PATH = useDefaultConfigFile({
	tempDir: TEMP_DIR,
});

test('Test CLI mock throws error if no name specified', async () => {

	// Mock Inquirer to skip the prompt for the recording name
	await mockInquirer({
		handler: (prompt) => {
			if (prompt.message.startsWith('Enter a name for this HAR recording')) {
				return { name: undefined };
			}
			if (prompt.message.startsWith('Enter the name of an existing HAR')) {
				return { name: undefined };
			}
			if (prompt.message.startsWith('Enter the URL to open')) {
				return { url: 'http://localhost:5173' };
			}
			throw new Error(`No mock response defined for: ${prompt.message}`);
		}
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
