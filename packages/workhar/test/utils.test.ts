import { test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as workharUtils from '../src/utils.js';
import { useTempDir } from '@adameisfeld/test-utils';

const TEMP_DIR = useTempDir();

test('_uniqueFileNameInDir creates _0 padded filename in empty dir', () => {
	const fileName = workharUtils._uniqueFileNameInDir(path.join(TEMP_DIR(), 'test'));
	expect(fileName).toBe(path.join(TEMP_DIR(), 'test_0.json'));
});

test('_uniqueFileNameInDir creates incremented filename in non-empty dir', () => {
	// Create a file to simulate an existing file
	fs.writeFileSync(path.join(TEMP_DIR(), 'test_0.json'), 'dummy content', 'utf-8');
	fs.writeFileSync(path.join(TEMP_DIR(), 'test_1.json'), 'dummy content', 'utf-8');
	const fileName = workharUtils._uniqueFileNameInDir(path.join(TEMP_DIR(), 'test'));
	expect(fileName).toBe(path.join(TEMP_DIR(), 'test_2.json'));
});

test('_getGraphQLOperationName works for templated URLs', () => {
	const result = workharUtils._getGraphOperationName({
		"mimeType": "application/json",
		"text": JSON.stringify({
			"query": `query { getFoo { id name } }`,
		})
	});
	expect(result).toBe('getFoo');
});

test('_getGraphQLOperationName returns undefined for undefined input', () => {
	const postData = undefined;
	const result = workharUtils._getGraphOperationName(postData);
	expect(result).toBeUndefined();
});

test('_getGraphQLOperationName returns undefined for number as queryData', () => {
	const postData = {
		text: 12345 // Invalid type
	};
	const result = workharUtils._getGraphOperationName(postData);
	expect(result).toBeUndefined();
});

test('_getGraphQLOperationName returns undefined for array as queryData', () => {
	const postData = {
		text: JSON.stringify([1, 2, 3]) // Invalid type
	};
	const result = workharUtils._getGraphOperationName(postData);
	expect(result).toBeUndefined();
});

test('_getGraphQLOperationName returns undefined for undefined as queryData', () => {
	const postData = {};
	const result = workharUtils._getGraphOperationName(postData);
	expect(result).toBeUndefined();
});

test('_getGraphQLOperationName returns undefined for no selections in selection set', () => {
	const postData = {
		text: JSON.stringify({
			query: `query EmptyQuery { }`
		})
	};
	const result = workharUtils._getGraphOperationName(postData);
	expect(result).toBeUndefined();
});

test('_getGraphQLOperationName returns undefined if first selection is not of kind "Field"', () => {
	const postData = {
		text: JSON.stringify({
			query: `query SpreadQuery { ...someFragment } fragment someFragment on User { id }`
		})
	};
	const result = workharUtils._getGraphOperationName(postData);
	expect(result).toBeUndefined();
});

test('_getGraphQLOperationName returns undefined if no firstOp', () => {
	const postData = {
		text: JSON.stringify({
			query: `
				fragment someFragment on User {
					id
				}
			`
		}),
	};
	const result = workharUtils._getGraphOperationName(postData);
	expect(result).toBeUndefined();
});
