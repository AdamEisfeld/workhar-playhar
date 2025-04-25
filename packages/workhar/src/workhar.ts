import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import * as utils from './utils.js';
import * as errors from './errors.js';
import * as types from './types.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// HAR -> JSON

/**
 * Extracts all JSON payloads from a HAR file and saves them into structured `.json` files.
 * Also generates a `.workhar` mapping file with the modified HAR entries (pointing to the JSON files).
 *
 * - For GraphQL requests, extracts the operation name and appends it to the output path.
 * - For other requests, uses the request URL as the folder structure.
 *
 * @param fromHarFile - Path to the source HAR file.
 * @param toWorkharFile - Path to save the resulting .workhar file.
 * @param withJsonDirectory - Directory where JSON response files will be written.
 *
 * @throws WorkharErrorHarFileNotFound if the HAR file does not exist.
 * @throws WorkharErrorHarParseFailed if the HAR file cannot be parsed.
 * @throws WorkharErrorHarGraphQLParseFailed if the GraphQL operation name cannot be extracted.
 * @throws WorkharErrorHarResponseParseFailed if a response body cannot be parsed as JSON.
 */
export const har2json = async (options: {
	fromHarFile: string,
	toWorkharFile: string,
	withJsonDirectory: string,
}) => {

	const {
		fromHarFile,
		toWorkharFile,
		withJsonDirectory,
	} = options;

	if (!fs.existsSync(fromHarFile)) {
		throw new errors.WorkharErrorHarFileNotFound({
			harFilePath: fromHarFile,
		});
	}

	// Create the output directory if it doesn't exist
	if (!fs.existsSync(withJsonDirectory)) {
		fs.mkdirSync(withJsonDirectory, { recursive: true });
	}

	// Parse the input HAR file into a mutable object we can modify
	const harJSON = JSON.parse(fs.readFileSync(fromHarFile, 'utf-8'));
	let mutableHarObject: z.infer<typeof types.HarFileSchema>;
	try {
		mutableHarObject = types.HarFileSchema.passthrough().parse(harJSON);
	} catch(error) {
		throw new errors.WorkharErrorHarParseFailed({
			harFilePath: fromHarFile,
			error,
		});
	}

	// Iterate over the HAR entries and extract JSON payloads into .json files, replacing
	// the content of the HAR with the file paths of the extracted JSON files
	// The directory structure of the JSON files will mirror the request URLs
	// For example, a request to https://example.com/api/data will create a file at
	// https:// -> example.com -> api -> data_0.json
	
	for (const entry of mutableHarObject.log.entries) {

		// Skip entries that don't have a response or don't contain JSON content
		const requestURL = entry.request.url;
		const content = entry.response.content;
		if (!content || !content.text || typeof content.mimeType !== 'string' || !content.mimeType?.includes('application/json')) continue;

		let relativePath: string;
		if (requestURL.includes('/graphql')) {
			// For GraphQL requests, we extract the operation name being performed and append it to the path of the generated JSON file
			// For example, a GraphQL request to https://example.com/graphql with an operation name of "getUser" will create a file at
			// https:// -> example.com -> graphql -> getUser_0.json
			const operationName = utils._getGraphOperationName(entry.request.postData);
			if (!operationName) {
				throw new errors.WorkharErrorHarGraphQLParseFailed({
					requestURL,
				});
			}
			relativePath = path.join(requestURL, operationName);
		} else {
			// For non-GraphQL requests, we use the request URL as the base path for the JSON file
			relativePath = requestURL;
		}

		const entryJsonFilePath = utils._uniqueFileNameInDir(path.join(withJsonDirectory, relativePath));
		fs.mkdirSync(path.dirname(entryJsonFilePath), { recursive: true });

		try {
			// Write the JSON content to the extracted .json file
			const entryJson = JSON.parse(content.text);
			const entryFileContents = JSON.stringify(entryJson, null, '\t');
			fs.writeFileSync(entryJsonFilePath, entryFileContents, 'utf-8');
			content.text = path.relative(withJsonDirectory, entryJsonFilePath);
		} catch(error) {
			throw new errors.WorkharErrorHarResponseParseFailed({
				requestURL,
				error,
			});
		}
	}

	// Write the .workhar file
	const harMap: types.WorkharFile = {
		har: mutableHarObject,
	};
	
	const outText = JSON.stringify(harMap, null, '\t');
	fs.writeFileSync(toWorkharFile, outText, 'utf-8');

};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// JSON -> HAR

/**
 * Rehydrates a HAR file using JSON response files referenced by a `.workhar` file.
 * Reads each mapped response content, replaces the HAR content with the corresponding JSON.
 *
 * @param fromWorkharFile - Path to the .workhar file.
 * @param withJsonDirectory - Directory where JSON files are located.
 * @param toHarFile - Path to save the resulting hydrated HAR file.
 *
 * @throws WorkharErrorJsonWorkharFileNotFound if the .workhar file is missing.
 * @throws WorkharErrorJsonDirectoryNotFound if the JSON directory is missing.
 * @throws WorkharErrorJsonWorkharParseFailed if the .workhar file is malformed.
 * @throws WorkharErrorJsonFileParseFailed if a referenced JSON file cannot be parsed.
 */
export const json2har = async (options: {
	fromWorkharFile: string,
	withJsonDirectory: string,
	toHarFile: string,
}) => {

	const {
		fromWorkharFile,
		withJsonDirectory,
		toHarFile,
	} = options;

	if (!fs.existsSync(fromWorkharFile)) {
		throw new errors.WorkharErrorJsonWorkharFileNotFound({
			workharFile: fromWorkharFile,
		});
	}
	if (!fs.existsSync(withJsonDirectory)) {
		throw new errors.WorkharErrorJsonDirectoryNotFound({
			jsonDirectory: withJsonDirectory,
		});
	}

	// Parse the input .workhar file into a mutable object we can modify
	
	let mutableHarObject: z.infer<typeof types.HarFileSchema>;
	try {
		const mapString = fs.readFileSync(fromWorkharFile, 'utf-8');
		const mapObject = JSON.parse(mapString);
		const map: types.WorkharFile = types.WorkharFileSchema.passthrough().parse(mapObject);
		mutableHarObject = map.har;
	} catch(error) {
		throw new errors.WorkharErrorJsonWorkharParseFailed({
			workharFile: fromWorkharFile,
			error,
		});
	}

	// Iterate over the HAR entries and replace the content of the HAR with the content of the JSON files associated with each entry's response content text
	for (const entry of mutableHarObject.log.entries) {

		// Skip entries that don't have a response or don't contain JSON content
		const content = entry.response.content;
		if (!content || !content.text || !content.text.endsWith('.json')) continue;

		const relativePath = content.text;
		const entryJsonFilePath = path.join(withJsonDirectory, relativePath);

		if (!fs.existsSync(entryJsonFilePath)) {
			console.warn(`⚠️ JSON file missing: ${relativePath}`);
			continue;
		}

		try {
			const entryJson = JSON.parse(fs.readFileSync(entryJsonFilePath, 'utf-8'));
			content.text = JSON.stringify(entryJson);
		} catch(error) {
			throw new errors.WorkharErrorJsonFileParseFailed({
				jsonFilePath: entryJsonFilePath,
				error,
			});
		}
	}

	// Write the hydrated HAR file
	const outText = JSON.stringify(mutableHarObject, null, '\t');
	fs.writeFileSync(toHarFile, outText, 'utf-8');

};

export * as errors from './errors.js';
export * as types from './types.js';