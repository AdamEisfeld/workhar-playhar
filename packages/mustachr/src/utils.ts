import { ZodSchema, z } from 'zod';
import { MustachrErrorUtilsUnsupportedFileType, MustachrErrorUtilsNoExport, MustachrErrorUtilsFileNotFound } from './errors.js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Internal Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// File System

export const _firstFoundPath = (paths: string[]): string | undefined => {
	for (const path of paths) {
		if (fs.existsSync(path)) {
			return path;
		}
	}
	return undefined;
};

export const _parseFileIntoSchema = async <T extends ZodSchema>(filePath: string, schema: T): Promise<z.infer<T>> => {

	const resolvedPath = path.isAbsolute(filePath)
		? filePath
		: path.resolve(process.cwd(), filePath);

	if (!fs.existsSync(resolvedPath)) {
		throw new MustachrErrorUtilsFileNotFound({
			filePath: resolvedPath,
		});
	}

	if (resolvedPath.endsWith('.ts') || resolvedPath.endsWith('.js') || resolvedPath.endsWith('.mjs')) {
		const mod = await import(pathToFileURL(resolvedPath).href);
		const object = mod.default ?? mod;
		try {
			return schema.parse(object);
		} catch {
			throw new MustachrErrorUtilsNoExport({
				filePath: resolvedPath,
			});
		}
		
	}

	// Support for .json fallback
	if (resolvedPath.endsWith('.json')) {
		const object = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
		return schema.parse(object);
	}

	throw new MustachrErrorUtilsUnsupportedFileType({
		filePath: resolvedPath,
	});

};

export const _escapeRegex = (str: string): string => {
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
