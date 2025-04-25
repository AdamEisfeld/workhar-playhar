import { expect, test } from 'vitest';
import * as playhar from '../src/playhar';
import { run } from '../src/bridge';

test('Test CLI mock throws error if custom config file does not exist', async () => {

	// Run mock while passing a non-existent config file path
	try {
		await run(['node', 'playhar', 'mock', '--config', 'non-existent_file_path']);
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(playhar.errors.PlayharErrorConfigFileNotFound);
	}

});
