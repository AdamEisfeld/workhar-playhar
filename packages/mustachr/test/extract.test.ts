import { expect, test } from 'vitest';
import * as mustachr from '../src/mustachr.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Fixed Strings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Happy Paths

test('Test extracting fixed strings', async () => {

	const input = 'Bearer Foo';

	const extractions: mustachr.types.MustachrExtractions = [
		{
			type: 'string',
			property: 'TOKEN',
			search: 'Foo',
			replace: '{{ property }}'
		}
	];

	const extracted = await mustachr.extract({
		input,
		extractions,
	});

	expect(extracted).toBe('Bearer {{ TOKEN }}');

});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Error Paths

test('Test extracting fixed strings with empty search', async () => {

	const input = 'Bearer Foo';

	const extractions: mustachr.types.MustachrExtractions = [
		{
			type: 'string',
			property: 'TOKEN',
			search: '',
			replace: '{{ property }}'
		}
	];

	try {
		await mustachr.extract({
			input,
			extractions,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorExtractionsEmptyStringPattern);
	}

});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Regular Expressions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Happy Paths

test('Test extracting regular expressions as strings', async () => {
	
	const input = 'Bearer Foo';

	const extractions: mustachr.types.MustachrExtractions = [
		{
			type: 'regex',
			property: 'TOKEN',
			search: 'Bearer (.*)',
			replace: 'Bearer {{ property }}'
		}
	];

	const extracted = await mustachr.extract({
		input,
		extractions,
	});

	expect(extracted).toBe('Bearer {{ TOKEN }}');

});

test('Test extracting regular expressions as Regexp', async () => {
	
	const input = 'Bearer Foo';

	const extractions: mustachr.types.MustachrExtractions = [
		{
			type: 'regex',
			property: 'TOKEN',
			search: /^(Bearer) (.*)/,
			replace: 'Bearer {{ property }}'
		}
	];

	const extracted = await mustachr.extract({
		input,
		extractions,
	});

	expect(extracted).toBe('Bearer {{ TOKEN }}');

});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Error Paths

test('Test extracting regular expressions with empty search', async () => {
	
	const input = 'Bearer Foo';

	const extractions: mustachr.types.MustachrExtractions = [
		{
			type: 'regex',
			property: 'TOKEN',
			search: '',
			replace: 'Bearer {{ property }}'
		}
	];

	try {
		await mustachr.extract({
			input,
			extractions,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorExtractionsEmptyRegexPattern);
	}
	
});	

test('Test extracting invalid regex', async () => {

	const input = 'Bearer Foo';

	const extractions: mustachr.types.MustachrExtractions = [
		{
			type: 'regex',
			property: 'TOKEN',
			search: '\\',
			replace: 'Bearer {{ property }}'
		},
	];

	try {
		await mustachr.extract({
			input,
			extractions,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorExtractionsInvalidRegex);
	}

});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Environment Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test extracting from .env values', async () => {

	const input = 'Bearer Foo';

	const extractions: mustachr.types.MustachrExtractions = [
		{
			type: 'env',
			path: './test/files/.fakeenv.stub',
		}
	];

	const extracted = await mustachr.extract({
		input,
		extractions,
	});

	expect(extracted).toBe('Bearer {{ TOKEN }}');

});

test('Test extracting from non-existent .env file', async () => {

	const input = 'Bearer Foo';

	const extractions: mustachr.types.MustachrExtractions = [
		{
			type: 'env',
			path: './test/files/.env.stub.non-existent',
		}
	];

	try {
		await mustachr.extract({
			input,
			extractions,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorEnvFileNotFound);
	}

});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: TypeScript Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test extracting using .ts file', async () => {

	const extractions = await mustachr.extractionsFromFile({
		file: './test/files/extractions.stub.ts',
		fallbacks: [],
	}) ?? [];

	const extracted = await mustachr.extract({
		input: 'Bearer Foo',
		extractions,
	});

	expect(extracted).toBe('Bearer {{ TOKENTS }}');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: JavaScript Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test extracting using .js file', async () => {

	const extractions = await mustachr.extractionsFromFile({
		file: './test/files/extractions.stub.js',
		fallbacks: [],
	}) ?? [];

	const extracted = await mustachr.extract({
		input: 'Bearer Foo',
		extractions,
	});

	expect(extracted).toBe('Bearer {{ TOKENJS }}');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: JSON Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test extracting using .json file', async () => {

	const extractions = await mustachr.extractionsFromFile({
		file: './test/files/extractions.stub.json',
		fallbacks: [],
	}) ?? [];

	const extracted = await mustachr.extract({
		input: 'Bearer Foo',
		extractions,
	});

	expect(extracted).toBe('Bearer {{ TOKENJSON }}');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Fallback Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test extracting using fallback files', async () => {

	const extractions = await mustachr.extractionsFromFile({
		file: undefined,
		fallbacks: [
			'./test/files/extractions.stub.ts',
			'./test/files/extractions.stub.js',
			'./test/files/extractions.stub.json',
		],
	}) ?? [];

	const extracted = await mustachr.extract({
		input: 'Bearer Foo',
		extractions,
	});

	expect(extracted).toBe('Bearer {{ TOKENTS }}');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Invalid Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test extracting a non-existent file', async () => {

	const filePath = './test/files/non-existent-file.js';
	try {
		await mustachr.extractionsFromFile({
			file: filePath,
			fallbacks: [],
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorExtractionsFileNotFound);
	}

});

test('Test extracting no file', async () => {

	try {
		await mustachr.extractionsFromFile({
			file: undefined,
			fallbacks: [],
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorExtractionsFileNotFound);
	}

});

test('Test extracting invalid extraction type', async () => {

	const input = 'Bearer Foo';

	const extractions: mustachr.types.MustachrExtractions = [
		{
			type: 'invalid',
		} as unknown as {
			type: 'string',
			property: string,
			search: string,
			replace: string,
		}
	];

	try {
		await mustachr.extract({
			input,
			extractions,
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorExtractionsUnrecognized);
	}

});