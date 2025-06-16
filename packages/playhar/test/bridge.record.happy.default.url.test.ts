import { test } from 'vitest';
import fs from 'fs';
import path from 'path';
import { mockInquirer, mockRecording, useTempDir } from '@adameisfeld/test-utils';
import { useDefaultConfigFile } from './helpers.js';

const TEMP_DIR = useTempDir();

useDefaultConfigFile({
	tempDir: TEMP_DIR,
	defaultRecordingUrl: 'https://example.com',
});

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
				return { url: '' };
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

	const { run } = await import('../src/bridge');

	// Run the record CLI command
	await run(['node', 'playhar', 'record']);

});
