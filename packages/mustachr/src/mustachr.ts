import * as errors from './errors.js';
import * as types from './types.js';
import * as utils from './utils.js';
import dotenv from 'dotenv';
import fs from 'fs';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Extractions

/**
 * Defines and returns a set of extractions. This is a helper for config files.
 */
export const defineExtractions = (config: types.MustachrExtractions): types.MustachrExtractions => {
	 return config;
};

/**
 * Loads and parses a Mustachr extractions file (JS, TS, or JSON) using Zod validation.
 * If no specific file is provided, fallback paths will be checked.
 * 
 * @throws MustachrErrorExtractionsFileNotFound if no file is found or it doesn't exist.
 */
export const extractionsFromFile = async (options: {
	   file?: string | undefined,
	fallbacks: string[],
}): Promise<types.MustachrExtractions> => {
	const filePath = options.file || utils._firstFoundPath(options.fallbacks);
	if (!filePath) {
		throw new errors.MustachrErrorExtractionsFileNotFound({
			extractionsFilePath: filePath,
		});
	}

	if (!fs.existsSync(filePath)) {
		throw new errors.MustachrErrorExtractionsFileNotFound({
			extractionsFilePath: filePath,
		});
	}

	return await utils._parseFileIntoSchema(filePath, types.MustachrExtractionsSchema);
};

/**
 * Applies all extraction rules to an input string.
 * Environment values, fixed strings, and regex patterns are replaced with mustache-style tokens.
 * 
 * @throws MustachrErrorEnvFileNotFound if an .env file is missing or unreadable.
 * @throws MustachrErrorExtractionsEmptyStringPattern if a string extraction has an empty pattern.
 * @throws MustachrErrorExtractionsEmptyRegexPattern if a regex extraction has an empty pattern.
 * @throws MustachrErrorExtractionsInvalidRegex if a regex extraction is invalid.
 * @throws MustachrErrorExtractionsUnrecognized if an unknown extraction type is encountered.
 */
export const extract = async (options: {
	input: string,
	extractions: types.MustachrExtractions,
}): Promise<string> => {

	const {
		input,
		extractions,
	} = options;

	let mutableFileContents = input;
	
	type InputTransformer = (_input: string) => string;
	const transformers: InputTransformer[] = [];

	for (const extraction of extractions) {
		switch (extraction.type) {
		case 'env': {
			const env = dotenv.config({ path: extraction.path }).parsed;
			if (!env || fs.existsSync(extraction.path) === false) {
				throw new errors.MustachrErrorEnvFileNotFound({
					envFilePath: extraction.path,
				});
			}
			for (const [key, val] of Object.entries(env)) {
				const escaped = utils._escapeRegex(val);
				const token = `{{ ${key} }}`;
				transformers.push((input) => input.replace(val, token).replace(escaped, token));
			}
			break;
		}
		case 'string': {
			if (!extraction.search?.trim()) {
				throw new errors.MustachrErrorExtractionsEmptyStringPattern({
					extractionProperty: extraction.property,
				});
			}
			const escaped = utils._escapeRegex(extraction.search);
			const regex = new RegExp(escaped, 'g');
			const token = `{{ ${extraction.property} }}`;
			const template = extraction.replace;
			transformers.push((input) =>
				input.replace(regex, () =>
					template.replace(/{{\s*property\s*}}/g, token)
				)
			);
			break;
		}
		case 'regex': {
			if (typeof extraction.search === 'string' && !extraction.search?.trim()) {
				throw new errors.MustachrErrorExtractionsEmptyRegexPattern({
					extractionProperty: extraction.property,
				});
			}
			let regex: RegExp;
			try {
				regex = typeof extraction.search === 'string' ? new RegExp(extraction.search, 'g') : extraction.search;
			} catch {
				throw new errors.MustachrErrorExtractionsInvalidRegex({
					extractionProperty: extraction.property,
					extractionRegex: extraction.search,
				});
			}
			const token = `{{ ${extraction.property} }}`;
			const template = extraction.replace;
			transformers.push((input) => {
				return input.replace(regex, () => {
					const output = template.replace(/{{\s*property\s*}}/g, token);
					return output;
				});
			});
			break;
		}
		default:
			throw new errors.MustachrErrorExtractionsUnrecognized({
				extraction,
			});
		}
	}

	// Apply all transformations in sequence
	for (const transform of transformers) {
		mutableFileContents = transform(mutableFileContents);
	}

	return mutableFileContents;

};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Injections

/**
 * Defines and returns a set of injection values. This is a helper for config files.
 */
export const defineInjections = (config: Record<string, string>): Record<string, string> => {
	return config;
};

/**
 * Loads and parses a Mustachr injections file (JS, TS, or JSON) using Zod validation.
 * If no specific file is provided, fallback paths will be checked.
 * 
 * @throws MustachrErrorInjectionsFileNotFound if no file is found or it doesn't exist.
 */
export const injectionsFromFile = async (options: {
	file?: string | undefined,
	fallbacks: string[],
}): Promise<Record<string, string>> => {
	const filePath = options.file || utils._firstFoundPath(options.fallbacks);
	if (!filePath) {
		throw new errors.MustachrErrorInjectionsFileNotFound({
			injectionsFilePath: filePath,
		});
	}
	if (!fs.existsSync(filePath)) {
		throw new errors.MustachrErrorInjectionsFileNotFound({
			injectionsFilePath: filePath,
		});
	}

	return await utils._parseFileIntoSchema(filePath, types.MustachrInjectionSchema);
};

/**
 * Replaces all mustache-style tokens in the input string with actual values from the injections map.
 * 
 * Example: "Bearer {{ TOKEN }}" + { TOKEN: "123" } → "Bearer 123"
 */
export const inject = (options: {
	input: string,
	injections: Record<string, string>,
}): string => {

	const {
		input,
		injections,
	} = options;

	let mutableFileContent = input;

	for (const [key, value] of Object.entries(injections)) {
		mutableFileContent = mutableFileContent.split(`{{ ${key} }}`).join(value);
	}

	return mutableFileContent;
}

export * as errors from './errors.js';
export * as types from './types.js';
export * as utils from './utils.js';

