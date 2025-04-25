import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, beforeEach, vi } from 'vitest';

export const createTempDir = (id?: string): string => {
	const uuid = id || crypto.randomUUID();
	const ostmpdir = path.join(os.tmpdir(), uuid);
	return fs.mkdtempSync(ostmpdir);
};

export const deleteTempDir = (dir: string): void => {
	try {
		fs.rmSync(dir, { recursive: true, force: true });
	} catch (error) {
		if (typeof error === 'object' && error && 'code' in error && (error as { code: string }).code === 'ENOENT') {
			return;
		}
		throw error;
	}
};

export const useTempDir = (id?: string): (() => string) => {

	let TEMP_DIR: string;

	beforeEach(() => {
		TEMP_DIR = createTempDir(id);
	});

	afterEach(() => {
		deleteTempDir(TEMP_DIR);
	});

	return () => {
		return TEMP_DIR;
	};

};

export const mockInquirer = async (options: {
	handler: (prompt: { name: string; message: string }) => Record<string, unknown>;
}) => {
	vi.doMock('inquirer', () => ({
		default: {
			prompt: vi.fn().mockImplementation((questions) => {
				const questionArray = Array.isArray(questions) ? questions : [questions];
				const result: Record<string, unknown> = {};

				for (const question of questionArray) {
					const response = options.handler(question);
					Object.assign(result, response);
				}

				return Promise.resolve(result);
			}),
		},
	}));
};

export const mockRecording = async (options: {
	tempDir: string,
	recordingName: string,
	harRecording: string,
}) => {

	// vi.doMock('inquirer', () => ({
	// 	default: {
	// 		prompt: vi.fn().mockResolvedValue({ name: options.recordingName }),
	// 	},
	// }));
	
	// you can also mock playwright here dynamically if needed:
	vi.doMock('@playwright/test', () => {
		const harPath = path.join(options.tempDir, options.recordingName, 'api.har');
		return {
			chromium: {
				launch: vi.fn().mockResolvedValue({
					newContext: vi.fn().mockResolvedValue({
						newPage: vi.fn().mockResolvedValue({
							goto: vi.fn(),
							pause: vi.fn(() => {
								// Playhar calls pause() when recording is supposed to start. At this point, the user will be seeing the Playwright
								// recording dialog, and it is up to them to click record, interact with their page, and then click stop / continue to
								// continue execution of playhar. During this process, the .har file is recorded.
								// So, we will create a .har file here.
								fs.mkdirSync(path.dirname(harPath), { recursive: true });
								fs.writeFileSync(harPath, options.harRecording, 'utf-8');
							}),
						}),
						close: vi.fn(),
					}),
					close: vi.fn(),
				}),
			},
		};
	});

};
