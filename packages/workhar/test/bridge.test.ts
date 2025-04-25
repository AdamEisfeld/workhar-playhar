import { test, expect } from 'vitest';
import { run } from '../src/bridge';
import fs from 'fs';
import path from 'path';
import { useTempDir } from 'test-utils';
import * as workhar from '../src/workhar.js';

const TEMP_DIR = useTempDir();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: --har2json
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test CLI har2json happy path', async () => {

	const inputHarFilePath = path.join(TEMP_DIR(), 'input.har');
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

	fs.writeFileSync(inputHarFilePath, JSON.stringify(mockHar, null, '\t'), 'utf-8');
	await run(['node', 'workhar', 'har2json', inputHarFilePath, workharFileLocation, '--json', jsonDir]);

});

test('Test CLI har2json throws error if input file does not exist', async () => {

	const jsonDir = path.join(TEMP_DIR(), 'json');

	const nonExistentFilePath = path.join(TEMP_DIR(), 'non_existent_file.har');
	try {
		await run(['node', 'workhar', 'har2json', nonExistentFilePath, nonExistentFilePath, '--json', jsonDir]);
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(workhar.errors.WorkharErrorHarFileNotFound);
	}
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: --json2har
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test CLI json2har happy path', async () => {

	const inputHarFilePath = path.join(TEMP_DIR(), 'input.har');
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

	fs.writeFileSync(inputHarFilePath, JSON.stringify(mockHar, null, '\t'), 'utf-8');
	await run(['node', 'workhar', 'har2json', inputHarFilePath, workharFileLocation, '--json', jsonDir]);
	await run(['node', 'workhar', 'json2har', workharFileLocation, inputHarFilePath, '--json', jsonDir]);

});

test('Test CLI json2har throws error if input file does not exist', async () => {

	const jsonDir = path.join(TEMP_DIR(), 'json');
	const nonExistentFilePath = path.join(TEMP_DIR(), 'non_existent_file.json');

	try {
		await run(['node', 'workhar', 'json2har', nonExistentFilePath, nonExistentFilePath, '--json', jsonDir]);
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(workhar.errors.WorkharErrorJsonWorkharFileNotFound);
	}

});
