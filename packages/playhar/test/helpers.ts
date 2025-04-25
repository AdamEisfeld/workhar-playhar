import { beforeEach } from "vitest";
import path from "path";
import fs from "fs";
import { mockInquirer, mockRecording } from "test-utils";

export const useDefaultConfigFile = (options: {
	tempDir: () => string;
}): () => string => {

	let configFilePath: string = '';

	beforeEach(() => {

		// Change the directory to the temp directory
		process.chdir(options.tempDir());
	
		// Create a default playhar config
		const config = {
			directory: options.tempDir(),
			baseRecordingUrl: 'https://example/default-config',
			baseRequestUrl: 'https://api.example.com',
			extractions: [
				{
					"type": "regex",
					"property": "SECRET_TOKEN",
					"search": "\\\\\"token\\\\\":\\\\\"[^\"]*\\\\\"",
					"replace": "\\\"token\\\":\\\"{{ property }}\\\""
				}
			],
		};
		configFilePath = path.join(options.tempDir(), 'playhar.config.ts');
		fs.writeFileSync(configFilePath, `export default ${JSON.stringify(config)}`);

	});

	return () => configFilePath;
}

export const mockAnyRecording = async (options: {
	recordingName: string,
	tempDir: () => string;
}) => {
	// Mock Inquirer to skip the prompt for the recording name
	await mockInquirer({
		response: {
			name: options.recordingName,
		},
	});

	// Mock Playwright to record a fake har file so we don't launch a real browser or pause
	await mockRecording({
		tempDir: options.tempDir(),
		recordingName: options.recordingName,
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
}