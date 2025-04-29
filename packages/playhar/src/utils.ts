import path from 'path';
import * as types from './types.js';
import * as fs from 'fs';
import * as os from 'os';

export const _getRecordingDirectory = (options: {
	config: types.PlayharConfig,
	name: string,
}): string => {

	const {
		config,
		name,
	} = options;

	const recordingDirectory = path.join(config.directory, name);
	return recordingDirectory;
};

export const _getRecordingHarFilePath = (options: {
	recordingDirectory: string,
}): string => {
	return path.join(options.recordingDirectory, 'api.har');
};

export const _getRecordingJsonDirectory = (options: {
	recordingDirectory: string,
}): string => {
	return path.join(options.recordingDirectory, 'json');
};

export const _getWorkharFilePath = (options: {
	recordingDirectory: string,
}): string => {
	return path.join(options.recordingDirectory, '.workhar');
};

export const _getTempHarFilePath = (): string => {
	const uuid = crypto.randomUUID();
	const ostmpdir = path.join(os.tmpdir(), uuid);
	const tempDir = fs.mkdtempSync(ostmpdir);
	const tempHarFile = path.join(tempDir, 'temp.har');
	return tempHarFile;
};
