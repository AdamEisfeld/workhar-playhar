import { test, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as workhar from '../src/workhar.js';
import { useTempDir } from 'test-utils';

const TEMP_DIR = useTempDir();

test('json2har happy path', async () => {

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

	// Read the first entry .json file in
	const firstFilePathRelative = 'https:/example.com/api/data_0.json';
	const firstJsonFilePath = path.join(jsonDir, firstFilePathRelative);
	const firstJsonContent = fs.readFileSync(firstJsonFilePath, 'utf-8');
	const firstJson = JSON.parse(firstJsonContent);
	
	// Modify the first entry content
	firstJson.hello = 'universe';

	// Write the modified content back to the file
	fs.writeFileSync(firstJsonFilePath, JSON.stringify(firstJson, null, '\t'), 'utf-8');

	// Convert JSON back to HAR
	await workhar.json2har({
		fromWorkharFile: workharFileLocation,
		withJsonDirectory: jsonDir,
		toHarFile: harFilePath,
	});

	// Read the HAR file in and parse it
	const harFileContents = fs.readFileSync(harFilePath, 'utf-8');
	const harFile = JSON.parse(harFileContents);
	const har = workhar.types.HarFileSchema.parse(harFile);

	// Check that the HAR file is valid and passes the schema
	expect(har).toBeDefined();
	expect(har.log.entries.length).toBe(2);
	expect(har.log.entries[0].response.content.text).toEqual(JSON.stringify(firstJson));
});

test('json2har throws on missing workhar file', async () => {

	const harFilePath = path.join(TEMP_DIR(), 'input.har');
	const jsonDir = path.join(TEMP_DIR(), 'json');

	// Attempt to convert JSON back to HAR without the JSON directory
	try {
		await workhar.json2har({
			fromWorkharFile: '',
			withJsonDirectory: jsonDir,
			toHarFile: harFilePath,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(workhar.errors.WorkharErrorJsonWorkharFileNotFound);
	}
	
});

test('json2har throws on missing json directory', async () => {

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

	// Attempt to convert JSON back to HAR without the JSON directory
	try {
		await workhar.json2har({
			fromWorkharFile: workharFileLocation,
			withJsonDirectory: 'missing_directory',
			toHarFile: harFilePath,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(workhar.errors.WorkharErrorJsonDirectoryNotFound);
	}

});

test('json2har logs warning if json file is missing for an entry', async () => {

	const harFilePath = path.join(TEMP_DIR(), 'input.har');
	const jsonDir = path.join(TEMP_DIR(), 'json');
	const workharFileLocation = path.join(TEMP_DIR(), '.workhar');

	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

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

	// Delete the JSON file for the first entry

	const firstFilePathRelative = 'https:/example.com/api/data_0.json';
	const firstJsonFilePath = path.join(jsonDir, firstFilePathRelative);
	fs.unlinkSync(firstJsonFilePath);

	// Convert JSON back to HAR
	await workhar.json2har({
		fromWorkharFile: workharFileLocation,
		withJsonDirectory: jsonDir,
		toHarFile: harFilePath,
	});

	// Check that the warning was logged
	expect(warnSpy).toHaveBeenCalledWith(
		`⚠️ JSON file missing: ${firstFilePathRelative}`
	);

});

test('json2har throws on invalid JSON file', async () => {

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

	const firstFilePathRelative = 'https:/example.com/api/data_0.json';
	const firstJsonFilePath = path.join(jsonDir, firstFilePathRelative);

	fs.writeFileSync(firstJsonFilePath, '{ invalid json', 'utf-8');

	try {
		await workhar.json2har({
			fromWorkharFile: workharFileLocation,
			withJsonDirectory: jsonDir,
			toHarFile: harFilePath,
		});
		
	} catch (error) {
		
		expect(error).toBeInstanceOf(workhar.errors.WorkharErrorJsonFileParseFailed);
		
	}

});

test('json2har throws on schema validation error', async () => {

	const harFilePath = path.join(TEMP_DIR(), 'input.har');
	const jsonDir = path.join(TEMP_DIR(), 'json');
	const workharFileLocation = path.join(TEMP_DIR(), '.workhar');

	// Create the json directory to satisfy json2har's requirement
	fs.mkdirSync(jsonDir, { recursive: true });

	// Create a mock workhar file with invalid schema and save it
	const mockWorkhar = {
		invalid: 'schema',
	};
	fs.writeFileSync(workharFileLocation, JSON.stringify(mockWorkhar, null, '\t'), 'utf-8');

	try {

		await workhar.json2har({
			fromWorkharFile: workharFileLocation,
			withJsonDirectory: jsonDir,
			toHarFile: harFilePath,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
		
	} catch (error) {
		
		expect(error).toBeInstanceOf(workhar.errors.WorkharErrorJsonWorkharParseFailed);
		
	}

});

test('json2har skips non-JSON files', async () => {

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

	const workharFileContents = fs.readFileSync(workharFileLocation, 'utf-8');
	const workharJson = JSON.parse(workharFileContents);
	const workharFile = workhar.types.WorkharFileSchema.parse(workharJson);
	
	// Replace the JSON file with a non-JSON file in the workharFile
	workharFile.har.log.entries[0].response.content.text = 'not a json file';
	fs.writeFileSync(workharFileLocation, JSON.stringify(workharFile, null, '\t'), 'utf-8');

	// Replace the JSON in the file with some new data
	const firstFilePathRelative = 'https:/example.com/api/data_0.json';
	const firstJsonFilePath = path.join(jsonDir, firstFilePathRelative);
	const firstJsonContent = fs.readFileSync(firstJsonFilePath, 'utf-8');
	const firstJson = JSON.parse(firstJsonContent);
	firstJson.hello = 'universe';

	// Write the modified content back to the file
	fs.writeFileSync(firstJsonFilePath, JSON.stringify(firstJson, null, '\t'), 'utf-8');

	// Convert JSON back to HAR

	await workhar.json2har({
		fromWorkharFile: workharFileLocation,
		withJsonDirectory: jsonDir,
		toHarFile: harFilePath,
	});

	// Read the HAR file in and parse it
	const harFileContents = fs.readFileSync(harFilePath, 'utf-8');
	const harFile = JSON.parse(harFileContents);
	const har = workhar.types.HarFileSchema.parse(harFile);

	// Ensure the updated JSON file was not included in the HAR
	expect(har.log.entries[0].response.content.text).toEqual('not a json file');

});