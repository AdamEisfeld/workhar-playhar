import * as graphql from 'graphql';
import fs from 'fs';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Internal Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// File System

/**
 * Creates a unique file name in the specified directory by appending a counter to the base path.
 * For example, if the base path is "example.json" and the directory already contains "example_0.json" and "example_1.json",
 * the function will return "example_2.json".
 * If the base path does not exist, it will append "_0" to the base path and return it.
 * @param basePath The base path for the file name.
 * @returns A unique file name in the specified directory.
 */
export const _uniqueFileNameInDir = (basePath: string): string => {
	if (!fs.existsSync(basePath + '_0.json')) return basePath + '_0.json';
	let counter = 1;
	while (fs.existsSync(`${basePath}_${counter}.json`)) counter++;
	return `${basePath}_${counter}.json`;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// GraphQL

/**
 * Extracts the operation name from a GraphQL request payload by parsing the GraphQL query string and returning the name of the first field.
 * If the operation name cannot be determined, it returns undefined.
 * @param postData 
 * @returns 
 */
export const _getGraphOperationName = (postData: unknown): string | undefined => {

	if (typeof postData !== 'object' || postData === undefined) return undefined;

	try {

		const text = (postData as { text: string }).text;
		if (typeof text !== 'string') return undefined;
		const queryData = JSON.parse(text);
		const graphQueryString = queryData?.query;
		if (typeof graphQueryString !== 'string') return undefined;
		
		const ast = graphql.parse(graphQueryString);
		const firstOp = ast.definitions.find((d): d is graphql.OperationDefinitionNode => d.kind === 'OperationDefinition');
		if (!firstOp) return undefined;

		const firstField = firstOp.selectionSet.selections[0];
		if (firstField && firstField.kind === 'Field' && firstField.name) {
			return firstField.name.value;
		}

		return undefined;

	} catch {
		return undefined;
	}
};
