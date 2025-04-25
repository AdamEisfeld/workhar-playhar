import { expect, test } from 'vitest';
import * as mustachr from '../src/mustachr.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Injections
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test injecting into tokens', async () => {

	const input = 'Bearer {{ TOKEN }}';

	const injected = mustachr.inject({
		input,
		injections: {
			'TOKEN': 'Bar',
		}
	});

	expect(injected).toBe('Bearer Bar');

});

test('Test injecting into tokens with multiple injections', async () => {

	const input = JSON.stringify({
		method: 'GET',
		url: 'https://example.com/api/{{ API_VERSION }}/endpoint',
		headers: {
			'Bearer': 'Auth {{ TOKEN }}',
		},
		body: {
			message: 'Hello {{ NAME }}',
		},
	});

	const injected = mustachr.inject({
		input,
		injections: {
			API_VERSION: 'v1',
			TOKEN: 'Bar',
			NAME: 'John Doe',
		}
	});

	expect(injected).toBe(JSON.stringify({
		method: 'GET',
		url: 'https://example.com/api/v1/endpoint',
		headers: {
			'Bearer': 'Auth Bar',
		},
		body: {
			message: 'Hello John Doe',
		},
	}));

});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: TypeScript Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test injecting using .ts file', async () => {

	const injections = await mustachr.injectionsFromFile({
		file: './test/files/injections.stub.ts',
		fallbacks: [],
	}) ?? {};

	const injected = mustachr.inject({
		input: 'Bearer {{ TOKEN }}',
		injections,
	});

	expect(injected).toBe('Bearer FooTS');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: JavaScript Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test injecting using .js file', async () => {

	const injections = await mustachr.injectionsFromFile({
		file: './test/files/injections.stub.js',
		fallbacks: [],
	}) ?? {};

	const injected = mustachr.inject({
		input: 'Bearer {{ TOKEN }}',
		injections,
	});

	expect(injected).toBe('Bearer FooJS');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: JSON Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test injecting using .json file', async () => {

	const injections = await mustachr.injectionsFromFile({
		file: './test/files/injections.stub.json',
		fallbacks: [],
	}) ?? {};

	const injected = mustachr.inject({
		input: 'Bearer {{ TOKEN }}',
		injections,
	});

	expect(injected).toBe('Bearer FooJSON');
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Fallback Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test injecting using fallback files', async () => {

	const injections = await mustachr.injectionsFromFile({
		file: undefined,
		fallbacks: [
			'./test/files/injections.stub.ts',
			'./test/files/injections.stub.js',
			'./test/files/injections.stub.json',
		],
	}) ?? {};

	const injected = mustachr.inject({
		input: 'Bearer {{ TOKEN }}',
		injections,
	});

	expect(injected).toBe('Bearer FooTS');
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Invalid Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test('Test injecting a non-existent file', async () => {

	try {
		await mustachr.injectionsFromFile({
			file: './test/files/non-existent-file.js',
			fallbacks: [],
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch(error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorInjectionsFileNotFound);
	}

});

test('Test injecting no file', async () => {

	try {
		await mustachr.injectionsFromFile({
			file: undefined,
			fallbacks: [],
		});
		throw new Error('Expected an error to be thrown, but it did not.');
	} catch (error) {
		expect(error).toBeInstanceOf(mustachr.errors.MustachrErrorInjectionsFileNotFound);
	}

});
