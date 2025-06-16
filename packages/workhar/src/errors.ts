// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Generic
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class WorkharErrorAny extends Error {
	
	public code: string;

	constructor(
		options: {
			message: string,
			code: string,
		},
	) {
		super(options.message);
		this.name = this.constructor.name;
		this.code = options.code;
	}

};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: HAR -> JSON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DIEHAR_ERROR_CODE_HAR_FILE_NOT_FOUND = 'DIEHAR_ERROR_CODE_HAR_FILE_NOT_FOUND';
export class WorkharErrorHarFileNotFound extends WorkharErrorAny {
	constructor(data: {
		harFilePath: string,
	}) {
		super({
			message: `HAR file not found: ${data.harFilePath}`,
			code: DIEHAR_ERROR_CODE_HAR_FILE_NOT_FOUND,
		});
	}
}

export const DIEHAR_ERROR_CODE_HAR_PARSE_FAILED = 'DIEHAR_ERROR_CODE_HAR_PARSE_FAILED';
export class WorkharErrorHarParseFailed extends WorkharErrorAny {

	constructor(data: {
		harFilePath: string | undefined,
		error: unknown,
	}) {
		super({
			message: `Failed to parse HAR file: ${data.harFilePath}.\n${data.error}`,
			code: DIEHAR_ERROR_CODE_HAR_PARSE_FAILED,
		});
	}

}

export const DIEHAR_ERROR_CODE_HAR_GRAPHQL_PARSE_FAILED = 'DIEHAR_ERROR_CODE_HAR_GRAPHQL_PARSE_FAILED';
export class WorkharErrorHarGraphQLParseFailed extends WorkharErrorAny {
	constructor(data: {
		requestURL: string,
	}) {
		super({
			message: `Failed to extract operation name from GraphQL request: ${data.requestURL}.\nData: ${JSON.stringify(data ?? {})}`,
			code: DIEHAR_ERROR_CODE_HAR_GRAPHQL_PARSE_FAILED,
		});
	}
}

export const DIEHAR_ERROR_CODE_HAR_RESPONSE_PARSE_FAILED = 'DIEHAR_ERROR_CODE_HAR_RESPONSE_PARSE_FAILED';
export class WorkharErrorHarResponseParseFailed extends WorkharErrorAny {
	constructor(data: {
		requestURL: string,
		error: unknown,
	}) {
		super({
			message: `Failed to parse HAR response content for ${data.requestURL}.\n${data.error}`,
			code: DIEHAR_ERROR_CODE_HAR_RESPONSE_PARSE_FAILED,
		});
	}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: JSON -> HAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DIEHAR_ERROR_CODE_JSON_DIRECTORY_NOT_FOUND = 'DIEHAR_ERROR_CODE_JSON_DIRECTORY_NOT_FOUND';
export class WorkharErrorJsonDirectoryNotFound extends WorkharErrorAny {
	constructor(data: {
		jsonDirectory: string,
	}) {
		super({
			message: `Directory not found: ${data.jsonDirectory}`,
			code: DIEHAR_ERROR_CODE_JSON_DIRECTORY_NOT_FOUND,
		});
	}
}

export const DIEHAR_ERROR_CODE_JSON_DIEHAR_FILE_NOT_FOUND = 'DIEHAR_ERROR_CODE_JSON_DIEHAR_FILE_NOT_FOUND';
export class WorkharErrorJsonWorkharFileNotFound extends WorkharErrorAny {
	constructor(data: {
		workharFile: string,
	}) {
		super({
			message: `File not found: ${data.workharFile}`,
			code: DIEHAR_ERROR_CODE_JSON_DIEHAR_FILE_NOT_FOUND,
		});
	}
}

export const DIEHAR_ERROR_CODE_JSON_DIEHAR_PARSE_FAILED = 'DIEHAR_ERROR_CODE_JSON_DIEHAR_PARSE_FAILED';
export class WorkharErrorJsonWorkharParseFailed extends WorkharErrorAny {
	constructor(data: {
		workharFile: string,
		error: unknown,
	}) {
		super({
			message: `Failed to parse .workhar file: ${data.workharFile}.\n${data.error}`,
			code: DIEHAR_ERROR_CODE_JSON_DIEHAR_PARSE_FAILED,
		});
	}
}

export const DIEHAR_ERROR_CODE_JSON_FILE_PARSE_FAILED = 'DIEHAR_ERROR_CODE_JSON_FILE_PARSE_FAILED';
export class WorkharErrorJsonFileParseFailed extends WorkharErrorAny {
	constructor(data: {
		jsonFilePath: string,
		error: unknown,
	}) {
		super({
			message: `Failed to parse JSON file: ${data.jsonFilePath}.\n${data.error}`,
			code: DIEHAR_ERROR_CODE_JSON_FILE_PARSE_FAILED,
		});
	}
}
