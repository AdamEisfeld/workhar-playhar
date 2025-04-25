import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';
import { mockInquirer, mockRecording, useTempDir } from 'test-utils';

const TEMP_DIR = useTempDir();

test('Test CLI mocking happy path', async () => {

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
	const { run } = await import('../src/bridge');

	// Create a playhar config file with extractions
	const config = playhar.defineConfig({
		directory: TEMP_DIR(),
		baseRecordingUrl: 'https://example.com/bridge-mock-happy',
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
	const configFilePath = path.join(TEMP_DIR(), 'temp.config.ts');
	fs.writeFileSync(configFilePath, `export default ${JSON.stringify(config, null, 2)}`, 'utf-8');

	// Run the record CLI command so we have a recording to work with
	await run(['node', 'playhar', 'record', '--config', configFilePath]);

	// Create some injections to be used in the mocking process
	const injections = playhar.defineInjections({
		SECRET_TOKEN: 'MockedToken',
	});
	const injectionsFilePath = path.join(TEMP_DIR(), 'injections.json');
	fs.writeFileSync(injectionsFilePath, JSON.stringify(injections, null, 2), 'utf-8');

	// Run the mock CLI command to create a mocked HAR file
	const outputFilePath = path.join(TEMP_DIR(), 'mocked.har');
	await run(['node', 'playhar', 'mock', '--config', configFilePath, '--name', RECORDING_NAME, '--injections', injectionsFilePath, '--out', outputFilePath]);

	// Verify the mocked HAR file was created
	expect(fs.existsSync(outputFilePath)).toBe(true);

	// Verify the mocked HAR file contains the injected token
	const mockedHarContent = fs.readFileSync(outputFilePath, 'utf-8');
	expect(mockedHarContent).toContain('MockedToken');

	// Verify the mocked HAR file does not contain the original token
	expect(mockedHarContent).not.toContain('SuperSecretToken');

});