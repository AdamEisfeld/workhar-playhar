import { expect, test } from 'vitest';
import { run } from '../src/bridge';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as mustachr from '../src/mustachr.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { useTempDir } from '@adameisfeld/test-utils';

const TEMP_DIR = useTempDir();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: --extract
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test CLI extract and replace file when --out is omitted', async () => {

	const inputFilePath = path.join(TEMP_DIR(), 'input.txt');
	const extractionsFilePath = path.join(__dirname, './files/extractions.stub.js');

	fs.writeFileSync(inputFilePath, 'Bearer Foo');

	await run(['node', 'mustachr', 'extract', inputFilePath, '--extractions', extractionsFilePath]);

	const outputContent = fs.readFileSync(inputFilePath, 'utf-8');
	expect(outputContent).toBe('Bearer {{ TOKENJS }}');

});

test('CLI extract creates new file when --out is specified', async () => {
	const inputFilePath = path.join(TEMP_DIR(), 'overwrite.txt');
	const outputFilePath = path.join(TEMP_DIR(), 'output.txt');
	const extractionsFilePath = path.join(__dirname, './files/extractions.stub.js');

	// Write initial content
	fs.writeFileSync(inputFilePath, 'Bearer Foo');

	// Run extract command without --out
	await run(['node', 'mustachr', 'extract', inputFilePath, '--extractions', extractionsFilePath, '--out', outputFilePath]);

	// Expect the file itself to be overwritten
	const content = fs.readFileSync(outputFilePath, 'utf-8');
	expect(content).toBe('Bearer {{ TOKENJS }}');
});

test('CLI Extract throws error if no extractions found', async () => {

	const inputFilePath = path.join(TEMP_DIR(), 'no-extractions.txt');
	const extractionsFilePath = './files/non-existent-file.js';

	// Write initial content
	fs.writeFileSync(inputFilePath, 'Bearer Foo');

	// Run extract command without --out
	await expect(
		run(['node', 'mustachr', 'extract', inputFilePath, '--extractions', extractionsFilePath])
	).rejects.toThrowError(`Failed to parse extractions file: ${extractionsFilePath}. Error: File not found`);

});

test('CLI Extract throws error if empty extractions file', async () => {

	const inputFilePath = path.join(TEMP_DIR(), 'empty-extractions.txt');
	const extractionsFilePath = path.join(TEMP_DIR(), 'empty.stub.json');

	// Write empty extractions file
	fs.writeFileSync(extractionsFilePath, '[]');

	// Write initial content
	fs.writeFileSync(inputFilePath, 'Bearer Foo');

	// Run extract command without --out
	try {
		await run(['node', 'mustachr', 'extract', inputFilePath, '--extractions', extractionsFilePath]);
	} catch (error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorNoExtractionsFound);
	}

});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: --inject
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test CLI inject and replace file when --out is omitted', async () => {

	const inputFilePath = path.join(TEMP_DIR(), 'input.txt');
	const injectionsFilePath = path.join(__dirname, './files/injections.stub.js');

	fs.writeFileSync(inputFilePath, 'Bearer {{ TOKEN }}');

	await run(['node', 'mustachr', 'inject', inputFilePath, '--injections', injectionsFilePath]);

	const outputContent = fs.readFileSync(inputFilePath, 'utf-8');
	expect(outputContent).toBe('Bearer FooJS');

});

test('CLI inject creates new file when --out is specified', async () => {
	const inputFilePath = path.join(TEMP_DIR(), 'overwrite.txt');
	const outputFilePath = path.join(TEMP_DIR(), 'output.txt');
	const injectionsFilePath = path.join(__dirname, './files/injections.stub.js');

	// Write initial content
	fs.writeFileSync(inputFilePath, 'Bearer {{ TOKEN }}');

	// Run inject command without --out
	await run(['node', 'mustachr', 'inject', inputFilePath, '--injections', injectionsFilePath, '--out', outputFilePath]);

	// Expect the file itself to be overwritten
	const content = fs.readFileSync(outputFilePath, 'utf-8');
	expect(content).toBe('Bearer FooJS');
});

test('CLI Inject throws error if no injections found', async () => {

	const inputFilePath = path.join(TEMP_DIR(), 'no-injections.txt');
	const injectionsFilePath = './files/non-existent-file.js';

	// Write initial content
	fs.writeFileSync(inputFilePath, 'Bearer {{ TOKEN }}');

	// Run inject command without --out
	await expect(
		run(['node', 'mustachr', 'inject', inputFilePath, '--injections', injectionsFilePath])
	).rejects.toThrowError(`Failed to parse injections file: ${injectionsFilePath}. Error: File not found`);

});

test('CLI Inject throws error if empty injections file', async () => {
	const inputFilePath = path.join(TEMP_DIR(), 'empty-injections.txt');
	const injectionsFilePath = path.join(TEMP_DIR(), 'empty.stub.json');

	// Write empty injections file
	fs.writeFileSync(injectionsFilePath, '{}');

	// Write initial content
	fs.writeFileSync(inputFilePath, 'Bearer {{ TOKEN }}');

	// Run inject command without --out
	try {
		await run(['node', 'mustachr', 'inject', inputFilePath, '--injections', injectionsFilePath]);
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorNoInjectionsFound);
	}

});