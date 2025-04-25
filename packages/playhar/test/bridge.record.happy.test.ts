import { test } from 'vitest';
import fs from 'fs';
import path from 'path';
import { mockInquirer, mockRecording, useTempDir } from 'test-utils';

const TEMP_DIR = useTempDir();

test('Test CLI record happy path', async () => {

	// Setup constants
	const RECORDING_NAME = 'test-recording';

	// Mock Inquirer to skip the prompt for the recording name
	await mockInquirer({
		handler: (prompt) => {
			if (prompt.message.startsWith('Enter a name for this HAR recording')) {
				return { name: RECORDING_NAME };
			}
			if (prompt.message.startsWith('Enter the name of an existing HAR')) {
				return { name: RECORDING_NAME };
			}
			if (prompt.message.startsWith('Enter the URL to open')) {
				return { url: 'http://localhost:5173' };
			}
			throw new Error(`No mock response defined for: ${prompt.message}`);
		}
	});

	// Mock Playwright to record a fake har file so we don't launch a real browser or pause
	await mockRecording({
		tempDir: TEMP_DIR(),
		recordingName: RECORDING_NAME,
		harRecording: JSON.stringify({
			log: {
				version: '1.2',
				creator: { name: 'Mock', version: '1.0' },
				pages: [],
				entries: [
					{
						request: {
							url: 'https://api.example.com/graphql',
							postData: {
								text: JSON.stringify({
									query: `query { getUser { id name } }`
								}),
							},
						},
						response: {
							content: {
								text: JSON.stringify({ data: { getUser: { id: 1, name: 'John', token: 'SuperSecretToken' } } }),
								mimeType: 'application/json',
							},
						},
					},
				],
			},
		}),
	});

	const playhar = await import('../src/playhar.js');
	const { run } = await import('../src/bridge');

	// Create a playhar config file
	const config = playhar.defineConfig({
		directory: TEMP_DIR(),
		baseRequestUrl: 'https://api.example.com',
		extractions: [],
	});
	const configFilePath = path.join(TEMP_DIR(), 'temp.config.ts');
	fs.writeFileSync(configFilePath, `export default ${JSON.stringify(config, null, 2)}`, 'utf-8');

	// Run the record CLI command
	await run(['node', 'playhar', 'record', '--config', configFilePath]);

});
