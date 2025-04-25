import { expect, test } from 'vitest';
import * as playhar from '../src/playhar';
import { run } from '../src/bridge';

test('Test CLI record throws error if config file does not exist', async () => {

	// Run record while passing a non-existent config file path to force the error
	try {
		await run(['node', 'playhar', 'record', '--config', 'non-existent_file_path']);
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(playhar.errors.PlayharErrorConfigFileNotFound);
	}

});
