// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Generic
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class MustachrErrorAny extends Error {
	
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
// MARK: Extractions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MUSTACHR_ERROR_CODE_NO_EXTRACTIONS_FOUND = 'MUSTACHR_ERROR_CODE_NO_EXTRACTIONS_FOUND';
export class MustachrErrorNoExtractionsFound extends MustachrErrorAny {

	constructor(data: {
		extractionsFilePath: string | undefined,
	}) {
		super({
			message: `Failed to parse extractions file: ${data.extractionsFilePath}. Error: No extractions found.`,
			code: MUSTACHR_ERROR_CODE_NO_EXTRACTIONS_FOUND,
		});
	}

}

export const MUSTACHR_ERROR_CODE_ENV_FILE_NOT_FOUND = 'MUSTACHR_ERROR_CODE_ENV_FILE_NOT_FOUND';
export class MustachrErrorEnvFileNotFound extends MustachrErrorAny {
	constructor(data: {
		envFilePath: string | undefined,
	}) {
		super({
			message: `Failed to load environment file: ${data.envFilePath}. Error: File not found.`,
			code: MUSTACHR_ERROR_CODE_ENV_FILE_NOT_FOUND,
		});
	}
}


export const MUSTACHR_ERROR_CODE_EXTRACTIONS_FILE_NOT_FOUND = 'MUSTACHR_ERROR_CODE_EXTRACTIONS_FILE_NOT_FOUND';
export class MustachrErrorExtractionsFileNotFound extends MustachrErrorAny {
	constructor(data: {
		extractionsFilePath: string | undefined,
	}) {
		super({
			message: `Failed to parse extractions file: ${data.extractionsFilePath}. Error: File not found.`,
			code: MUSTACHR_ERROR_CODE_EXTRACTIONS_FILE_NOT_FOUND,
		});
	}
}

export const MUSTACHR_ERROR_CODE_EXTRACTIONS_EMPTY_STRING_PATTERN = 'MUSTACHR_ERROR_CODE_EXTRACTIONS_EMPTY_STRING_PATTERN';
export class MustachrErrorExtractionsEmptyStringPattern extends MustachrErrorAny {
	constructor(data: {
		extractionProperty: string,
	}) {
		super({
			message: `Invalid extraction string: empty pattern for property "${data.extractionProperty}"`,
			code: MUSTACHR_ERROR_CODE_EXTRACTIONS_EMPTY_STRING_PATTERN,
		});
	}
}

export const MUSTACHR_ERROR_CODE_EXTRACTIONS_EMPTY_REGEX_PATTERN = 'MUSTACHR_ERROR_CODE_EXTRACTIONS_EMPTY_REGEX_PATTERN';
export class MustachrErrorExtractionsEmptyRegexPattern extends MustachrErrorAny {
	constructor(data: {
		extractionProperty: string,
	}) {
		super({
			message: `Invalid extraction regex: empty pattern for property "${data.extractionProperty}"`,
			code: MUSTACHR_ERROR_CODE_EXTRACTIONS_EMPTY_REGEX_PATTERN,
		});
	}
}

export const MUSTACHR_ERROR_CODE_EXTRACTIONS_INVALID_REGEX = 'MUSTACHR_ERROR_CODE_EXTRACTIONS_INVALID_REGEX';
export class MustachrErrorExtractionsInvalidRegex extends MustachrErrorAny {
	constructor(data: {
		extractionProperty: string,
		extractionRegex: string | RegExp,
	}) {
		super({
			message: `Invalid extraction regex: ${data.extractionRegex} for property "${data.extractionProperty}"`,
			code: MUSTACHR_ERROR_CODE_EXTRACTIONS_INVALID_REGEX,
		});
	}
}

export const MUSTACHR_ERROR_CODE_EXTRACTIONS_UNRECOGNIZED = 'MUSTACHR_ERROR_CODE_EXTRACTIONS_UNRECOGNIZED';
export class MustachrErrorExtractionsUnrecognized extends MustachrErrorAny {
	constructor(data: {
		extraction: unknown,
	}) {
		super({
			message: `Unrecognized extraction: ${JSON.stringify(data.extraction)}`,
			code: MUSTACHR_ERROR_CODE_EXTRACTIONS_UNRECOGNIZED,
		});
	}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Injections
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MUSTACHR_ERROR_CODE_NO_INJECTIONS_FOUND = 'MUSTACHR_ERROR_CODE_NO_INJECTIONS_FOUND';
export class MustachrErrorNoInjectionsFound extends MustachrErrorAny {

	constructor(data: {
		injectionsFilePath: string | undefined,
	}) {
		super({
			message: `Failed to parse injections file: ${data.injectionsFilePath}. Error: No injections found.`,
			code: MUSTACHR_ERROR_CODE_NO_INJECTIONS_FOUND,
		});
	}

}

export const MUSTACHR_ERROR_CODE_INJECTIONS_FILE_NOT_FOUND = 'MUSTACHR_ERROR_CODE_NO_INJECTIONS_FOUND';
export class MustachrErrorInjectionsFileNotFound extends MustachrErrorAny {

	constructor(data: {
		injectionsFilePath: string | undefined,
	}) {
		super({
			message: `Failed to parse injections file: ${data.injectionsFilePath}. Error: File not found.`,
			code: MUSTACHR_ERROR_CODE_NO_INJECTIONS_FOUND,
		});
	}

}

export const MUSTACHR_ERROR_CODE_INJECTIONS_PARSE_FAILED = 'MUSTACHR_ERROR_CODE_INJECTIONS_PARSE_FAILED';
export class MustachrErrorInjectionsParseFailed extends MustachrErrorAny {
	constructor(data: {
		injectionsFilePath: string | undefined,
		error: unknown,
	}) {
		super({
			message: `Failed to parse injections file: ${data.injectionsFilePath}. ${data.error}`,
			code: MUSTACHR_ERROR_CODE_INJECTIONS_PARSE_FAILED,
		});
	}

}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Utilities
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MUSTACHR_ERROR_CODE_UTILS_FILE_NOT_FOUND = 'MUSTACHR_ERROR_CODE_UTILS_FILE_NOT_FOUND';
export class MustachrErrorUtilsFileNotFound extends MustachrErrorAny {
	constructor(data: {
		filePath: string | undefined,
	}) {
		super({
			message: `Failed to parse file into schema: ${data.filePath}. Error: File not found.`,
			code: MUSTACHR_ERROR_CODE_UTILS_FILE_NOT_FOUND,
		});
	}
}

export const MUSTACHR_ERROR_CODE_UTILS_NO_EXPORT = 'MUSTACHR_ERROR_CODE_UTILS_NO_EXPORT';
export class MustachrErrorUtilsNoExport extends MustachrErrorAny {
	constructor(data: {
		filePath: string | undefined,
	}) {
		super({
			message: `Invalid format or missing export: ${data.filePath}`,
			code: MUSTACHR_ERROR_CODE_UTILS_NO_EXPORT,
		});
	}
}

export const MUSTACHR_ERROR_CODE_UTILS_UNSUPPORTED_FILE_TYPE = 'MUSTACHR_ERROR_CODE_UTILS_UNSUPPORTED_FILE_TYPE';
export class MustachrErrorUtilsUnsupportedFileType extends MustachrErrorAny {
	constructor(data: {
		filePath: string | undefined,
	}) {
		super({
			message: `Unsupported file type: ${data.filePath}`,
			code: MUSTACHR_ERROR_CODE_UTILS_UNSUPPORTED_FILE_TYPE,
		});
	}
}