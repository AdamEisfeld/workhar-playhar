// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Generic
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PlayharErrorAny extends Error {
	
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
// MARK: Config
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PLAYHAR_ERROR_CONFIG_PARSE_FAILED = 'PLAYHAR_ERROR_CONFIG_PARSE_FAILED';
export class PlayharErrorConfigParseFailed extends PlayharErrorAny {
	constructor(data: {
		configFilePath: string,
		error: unknown,
	}) {
		super({
			message: `HAR file not found: ${data.configFilePath}\nError: ${data.error}`,
			code: PLAYHAR_ERROR_CONFIG_PARSE_FAILED,
		});
	}
}

export const PLAYHAR_ERROR_CONFIG_FILE_NOT_FOUND = 'PLAYHAR_ERROR_CONFIG_FILE_NOT_FOUND';
export class PlayharErrorConfigFileNotFound extends PlayharErrorAny {
	constructor(data: {
		configFilePath: string,
	}) {
		super({
			message: `No config found in ${data.configFilePath}. Ensure a playhar.config.(ts|js|json) file exists in the current directory or provide a valid path via --config.`,
			code: PLAYHAR_ERROR_CONFIG_FILE_NOT_FOUND,
		});
	}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Recording
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PLAYHAR_ERROR_RECORDING_NAME_REQUIRED = 'PLAYHAR_ERROR_RECORDING_NAME_REQUIRED';
export class PlayharErrorRecordingNameRequired extends PlayharErrorAny {
	constructor() {
		super({
			message: `Recording name is required`,
			code: PLAYHAR_ERROR_RECORDING_NAME_REQUIRED,
		});
	}
}

export const PLAYHAR_ERROR_RECORDING_FILE_NOT_FOUND = 'PLAYHAR_ERROR_RECORDING_FILE_NOT_FOUND';
export class PlayharErrorRecordingFileNotFound extends PlayharErrorAny {
	constructor(data: {
		recordingDirectory: string,
		recordedHarFilePath: string,
	}) {
		super({
			message: `Recorded HAR file not found in ${data.recordingDirectory}. Ensure the recording was saved correctly.`,
			code: PLAYHAR_ERROR_RECORDING_FILE_NOT_FOUND,
		});
	}
}