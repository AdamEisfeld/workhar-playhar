import { expect, test } from 'vitest';
import fs from 'fs';
import { mockInquirer, mockRecording, useTempDir } from '@adameisfeld/test-utils';

const TEMP_DIR = useTempDir();

test('record happy path', async () => {

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

	// Create a playhar config
	const config = playhar.defineConfig({
		directory: TEMP_DIR(),
		baseRequestUrl: 'https://api.example.com',
		extractions: [],
	});

	// Run record, which will skip recording and use the mock har file, then process the recording as usual
	const {
		workharFilePath
	} = await playhar.record({
		config,
		name: RECORDING_NAME,
		prepare: async (page) => {
			await page.goto('https://example.com/');
		},
	});

	// Verify the workhar file was recorded to the correct location
	expect(fs.existsSync(workharFilePath)).toBe(true);

	const workharFileContents = fs.readFileSync(workharFilePath, 'utf-8');
	const workharFileJson = JSON.parse(workharFileContents);
	const workharFile = playhar.workharTypes.WorkharFileSchema.parse(workharFileJson);

	// Verify the har file contains the expected data
	expect(workharFile.har.log.entries[0].request.url).toBe('https://api.example.com/graphql');
});
