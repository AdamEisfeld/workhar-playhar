import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import * as utils from '../src/utils.js';
import * as mustachr from '../src/mustachr.js';
import { useTempDir } from '@adameisfeld/test-utils';

const TEMP_DIR = useTempDir();

const writeFile = (fileName: string, content: string) => {
	const fullPath = path.join(TEMP_DIR(), fileName);
	fs.writeFileSync(fullPath, content, 'utf-8');
	return fullPath;
};

test('_firstFoundPath returns first existing path', () => {
	const existing = writeFile('one.txt', 'ok');
	writeFile('two.txt', 'also ok');

	const result = utils._firstFoundPath(['nonexistent.txt', existing, 'two.txt']);
	expect(result).toBe(existing);
});

test('_firstFoundPath returns undefined if none found', () => {
	const result = utils._firstFoundPath(['missing1.txt', 'missing2.txt']);
	expect(result).toBeUndefined();
});

test('_parseFileIntoSchema parses valid JSON file', async () => {
	const schema = z.object({ foo: z.string() });
	const content = JSON.stringify({ foo: 'bar' });
	const filePath = writeFile('valid.json', content);

	const result = await utils._parseFileIntoSchema(filePath, schema);
	expect(result).toEqual({ foo: 'bar' });
});

test('_parseFileIntoSchema throws on invalid schema', async () => {
	const schema = z.object({ foo: z.string() });
	const filePath = writeFile('invalid.json', JSON.stringify({ foo: 123 }));

	await expect(() => utils._parseFileIntoSchema(filePath, schema)).rejects.toThrow();
});

test('_parseFileIntoSchema parses default export from .js', async () => {
	const schema = z.object({ foo: z.string() });
	const filePath = writeFile(
		'stub.js',
		`export default { foo: 'baz' };`
	);

	const resolved = path.resolve(filePath);
	const result = await utils._parseFileIntoSchema(resolved, schema);
	expect(result).toEqual({ foo: 'baz' });
});

test('_parseFileIntoSchema throws on missing file', async () => {
	const schema = z.object({ foo: z.string() });
	try {
		await utils._parseFileIntoSchema('nonexistent.json', schema);
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorUtilsFileNotFound);
	}
});

test('_parseFileIntoSchema throws on unsupported file extension', async () => {
	const schema = z.object({ foo: z.string() });
	const filePath = writeFile('unsupported.txt', 'Hello');

	try {
		await utils._parseFileIntoSchema(filePath, schema);
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorUtilsUnsupportedFileType);
	}
});

test('_parseFileIntoSchema throws on primitive export from .js file', async () => {
	const filePath = writeFile(
		'bad-primitive.js',
		`export default "just a string";`
	);

	const schema = z.object({ foo: z.string() });

	try {
		await utils._parseFileIntoSchema(path.resolve(filePath), schema);
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorUtilsNoExport);
	}
});

test('_parseFileIntoSchema throws on non-object default export from .js file', async () => {
	const filePath = writeFile(
		'bad-export.js',
		`export default null;`
	);

	const schema = z.object({ foo: z.string() });

	try {
		await utils._parseFileIntoSchema(path.resolve(filePath), schema);
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorUtilsNoExport);
	}
});
