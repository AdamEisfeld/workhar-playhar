import { test, expect } from 'vitest';
import * as workhar from '../src/workhar.js';
import { WorkharErrorHarGraphQLParseFailed, WorkharErrorHarParseFailed, WorkharErrorHarResponseParseFailed } from '../src/errors.js';
import fs from 'fs';
import path from 'path';
import { useTempDir } from '@adameisfeld/test-utils';

const TEMP_DIR = useTempDir();

test('har2json happy path', async () => {

	const harFilePath = path.join(TEMP_DIR(), 'input.har');
	const jsonDir = path.join(TEMP_DIR(), 'json');
	const workharFileLocation = path.join(TEMP_DIR(), '.workhar');

	const mockHar = {
		log: {
			version: '1.2',
			creator: {
				name: 'Playwright',
				version: '1.0'
			},
			pages: [],
			entries: [
				{
					request: {
						url: 'https://example.com/api/data',
					},
					response: {
						content: {
							text: JSON.stringify({ hello: 'world' }),
							mimeType: 'application/json'
						}
					}
				},
				{
					request: {
						url: 'https://example.com/graphql',
						postData: {
							text: JSON.stringify({ query: 'query { user { id name } }' })
						}
					},
					response: {
						content: {
							text: JSON.stringify({ data: { user: { id: '123', name: 'Alice' } } }),
							mimeType: 'application/json'
						}
					}
				}
			]
		}
	};
	fs.writeFileSync(harFilePath, JSON.stringify(mockHar, null, '\t'), 'utf-8');

	// Convert HAR to JSON
	await workhar.har2json({
		fromHarFile: harFilePath,
		toWorkharFile: workharFileLocation,
		withJsonDirectory: jsonDir,
	});
	
	// Check that the .workhar file was created
	expect(fs.existsSync(workharFileLocation)).toBe(true);

	// Check that the .workhar file is valid JSON and passes the schema
	const workharFileContents = fs.readFileSync(workharFileLocation, 'utf-8');
	const workharJson = JSON.parse(workharFileContents);
	const workharFile = workhar.types.WorkharFileSchema.parse(workharJson);

	expect(workharFile).toBeDefined();
	expect(workharFile.har.log.entries.length).toBe(2);

	// Check that the text content of each entry is a string pointing to the file location of the corresponding JSON file
	const firstEntry = workharFile.har.log.entries[0].response.content.text;
	const firstFilePathRelative = 'https:/example.com/api/data_0.json';
	expect(firstEntry).toEqual(firstFilePathRelative);

	// Check that the second entry is a string pointing to the file location of the corresponding JSON file
	const secondEntry = workharFile.har.log.entries[1].response.content.text;
	const secondFilePathRelative = 'https:/example.com/graphql/user_0.json';
	expect(secondEntry).toEqual(secondFilePathRelative);

	// Check that the first JSON file was created and is valid
	const firstJsonFilePath = path.join(jsonDir, firstFilePathRelative);
	expect(fs.existsSync(firstJsonFilePath)).toBe(true);
	const firstJsonContent = fs.readFileSync(firstJsonFilePath, 'utf-8');
	const firstJson = JSON.parse(firstJsonContent);
	expect(firstJson).toEqual(JSON.parse(mockHar.log.entries[0].response.content.text));

	// Check that the second JSON file was created and is valid
	const secondJsonFilePath = path.join(jsonDir, secondFilePathRelative);
	expect(fs.existsSync(secondJsonFilePath)).toBe(true);
	const secondJsonContent = fs.readFileSync(secondJsonFilePath, 'utf-8');
	const secondJson = JSON.parse(secondJsonContent);
	expect(secondJson).toEqual(JSON.parse(mockHar.log.entries[1].response.content.text));

});

test('har2json throws on invalid har schema', async () => {

	const harFilePath = path.join(TEMP_DIR(), 'input.har');
	const jsonDir = path.join(TEMP_DIR(), 'json');
	const workharFileLocation = path.join(TEMP_DIR(), '.workhar');

	const invalidJsonHar = {
		foo: {
			version: '1.2',
			creator: {
				name: 'Playwright',
				version: '1.0'
			},
			pages: [],
			entries: [
				{
					request: {
						url: 'https://example.com/api/data',
					},
					response: {
						content: {
							text: 'Not JSON',
							mimeType: 'text/plain'
						}
					}
				}
			]
		}
	};

	fs.writeFileSync(harFilePath, JSON.stringify(invalidJsonHar, null, '\t'), 'utf-8');

	try {
		await workhar.har2json({
			fromHarFile: harFilePath,
			toWorkharFile: workharFileLocation,
			withJsonDirectory: jsonDir,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(WorkharErrorHarParseFailed);
	}

});

test('har2json throws on indeterminate graphql query', async () => {

	const harFilePath = path.join(TEMP_DIR(), 'input.har');
	const jsonDir = path.join(TEMP_DIR(), 'json');
	const workharFileLocation = path.join(TEMP_DIR(), '.workhar');

	const invalidGraphqlHar = {
		log: {
			version: '1.2',
			creator: {
				name: 'Playwright',
				version: '1.0'
			},
			pages: [],
			entries: [
				{
					request: {
						url: 'https://example.com/graphql',
						postData: {
							text: JSON.stringify({ foo: 'query { user { id name } }' })
						}
					},
					response: {
						content: {
							text: JSON.stringify({ data: { user: { id: '123', name: 'Alice' } } }),
							mimeType: 'application/json'
						}
					}
				},
				{
					request: {
						url: 'https://example.com/graphql',
						postData: {
							text: JSON.stringify({ query: 'query { user { id name } }' })
						}
					},
					response: {
						content: {
							text: JSON.stringify({ data: { user: { id: '123', name: 'Alice' } } }),
							mimeType: 'application/json'
						}
					}
				}
			]
		}
	};

	fs.writeFileSync(harFilePath, JSON.stringify(invalidGraphqlHar, null, '\t'), 'utf-8');

	try {
		await workhar.har2json({
			fromHarFile: harFilePath,
			toWorkharFile: workharFileLocation,
			withJsonDirectory: jsonDir,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(WorkharErrorHarGraphQLParseFailed);
	}

});

test('har2json throws on invalid json content in entry response', async () => {

	const harFilePath = path.join(TEMP_DIR(), 'input.har');
	const jsonDir = path.join(TEMP_DIR(), 'json');
	const workharFileLocation = path.join(TEMP_DIR(), '.workhar');

	const invalidJsonContentHar = {
		log: {
			version: '1.2',
			creator: {
				name: 'Playwright',
				version: '1.0'
			},
			pages: [],
			entries: [
				{
					request: {
						url: 'https://example.com/api/data',
					},
					response: {
						content: {
							text: 'Not JSON',
							mimeType: 'application/json'
						}
					}
				}
			]
		}
	};

	fs.writeFileSync(harFilePath, JSON.stringify(invalidJsonContentHar, null, '\t'), 'utf-8');

	try {
		await workhar.har2json({
			fromHarFile: harFilePath,
			toWorkharFile: workharFileLocation,
			withJsonDirectory: jsonDir,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(WorkharErrorHarResponseParseFailed);
	}

});

test('har2json skips invalid mimeType', async () => {

	const harFilePath = path.join(TEMP_DIR(), 'input.har');
	const jsonDir = path.join(TEMP_DIR(), 'json');
	const workharFileLocation = path.join(TEMP_DIR(), '.workhar');
	
	const mockHar = {
		log: {
			version: '1.2',
			creator: {
				name: 'Playwright',
				version: '1.0'
			},
			pages: [],
			entries: [
				{
					request: {
						url: 'https://example.com/api/data',
					},
					response: {
						content: {
							text: JSON.stringify({ hello: 'one' }),
							mimeType: 'text/plain'
						}
					}
				},
				{
					request: {
						url: 'https://example.com/api/data',
					},
					response: {
						content: {
							text: JSON.stringify({ hello: 'two' }),
							mimeType: 'application/json'
						}
					}
				},
			]
		}
	};
	fs.writeFileSync(harFilePath, JSON.stringify(mockHar, null, '\t'), 'utf-8');

	await workhar.har2json({
		fromHarFile: harFilePath,
		toWorkharFile: workharFileLocation,
		withJsonDirectory: jsonDir,
	});
	
	// Expect 1 entry to be skipped, resulting in 1 total entries
	const workharFileContents = fs.readFileSync(workharFileLocation, 'utf-8');
	const workharJson = JSON.parse(workharFileContents);
	const workharFile = workhar.types.WorkharFileSchema.parse(workharJson);
	expect(workharFile).toBeDefined();
	expect(workharFile.har.log.entries.length).toBe(2);
	expect(workharFile.har.log.entries[1].response.content.text).toEqual('https:/example.com/api/data_0.json');

});
