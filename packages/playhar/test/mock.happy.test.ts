import { expect, test } from 'vitest';
import fs from 'fs';
import { mockInquirer, mockRecording, useTempDir } from 'test-utils';
import path from 'path';

const TEMP_DIR = useTempDir();

test('mock happy path', async () => {

	// Setup constants
	const RECORDING_NAME = 'test-recording';

	// Mock Inquirer to skip the prompt for the recording name
	await mockInquirer({
		response: {
			name: RECORDING_NAME,
		},
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
		baseRecordingUrl: 'https://example.com',
		baseRequestUrl: 'https://api.example.com',
		extractions: [
			{
				type: 'regex',
				property: 'SECRET_TOKEN',
				search: '\\\\\"token\\\\\":\\\\\"[^\"]*\\\\\"',
				replace: '\\\"token\\\":\\\"{{ property }}\\\"'
			}
		],
	});

	// Run record, which will skip recording and use the mock har file, then process the recording as usual
	await playhar.record({
		config,
		name: RECORDING_NAME,
	});

	// Create injections
	const injections = playhar.defineInjections({
		SECRET_TOKEN: 'MockedToken',
	});

	// Run the mock command to create a mocked HAR file
	const outputFilePath = path.join(TEMP_DIR(), 'mocked.har');
	await playhar.mock({
		config,
		name: RECORDING_NAME,
		injections: injections,
		toHarFile: outputFilePath,
	});
	
	// Verify the mocked HAR file was created
	expect(fs.existsSync(outputFilePath)).toBe(true);

	// Verify the mocked HAR file contains the injected token
	const mockedHarContent = fs.readFileSync(outputFilePath, 'utf-8');
	expect(mockedHarContent).toContain('MockedToken');

	// Verify the mocked HAR file does not contain the original token
	expect(mockedHarContent).not.toContain('SuperSecretToken');
});
