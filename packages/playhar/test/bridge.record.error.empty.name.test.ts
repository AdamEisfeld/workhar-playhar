import { expect, test } from 'vitest';
import { useTempDir } from 'test-utils';
import * as playhar from '../src/playhar.js';
import { run } from '../src/bridge.js';
import { useDefaultConfigFile } from './helpers.js';

const TEMP_DIR = useTempDir();

const CONFIG_FILE_PATH = useDefaultConfigFile({
	tempDir: TEMP_DIR,
});

test('Test CLI record throws error if empty name specified', async () => {

	// Run record while specifying an empty name to force the error
	try {
		await run(['node', 'playhar', 'record', '--config', CONFIG_FILE_PATH(), '--name', '', '--url', 'http://localhost:5173']);
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(playhar.errors.PlayharErrorRecordingNameRequired);
	}

});
