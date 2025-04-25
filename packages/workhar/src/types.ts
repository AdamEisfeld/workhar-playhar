import { z } from 'zod';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Internal Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Map

/**
 * Schema representing the structure of a valid HAR (HTTP Archive) file.
 * This includes request and response entries, as well as optional metadata.
 */
export const HarFileSchema = z.object({
	log: z.object({
		version: z.string(),
		creator: z.object({
			name: z.string(),
			version: z.string(),
		}).passthrough(),
		pages: z.array(z.unknown()),
		entries: z.array(z.object({
			request: z.object({
				url: z.string(),
				postData: z.object({
					text: z.string(),
				}).passthrough().optional(),
			}).passthrough(),
			response: z.object({
				content: z.object({
					text: z.string().optional(),
				}).passthrough(),
			}).passthrough(),
			cache: z.unknown().optional(),
			timings: z.unknown().optional(),
		}).passthrough()),
	}).passthrough(),
});

export type HarFile = z.infer<typeof HarFileSchema>;

/**
 * Schema representing a `.workhar` file, which wraps a HAR object.
 * Used to associate HAR files with their extracted JSON content during mocking workflows.
 */
export const WorkharFileSchema = z.object({
	har: HarFileSchema,
});

export type WorkharFile = z.infer<typeof WorkharFileSchema>;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Extractions

/**
 * Extraction rule that loads environment variables from a `.env` file
 * and identifies values to be replaced in the HAR payloads.
 */
export const WorkHarExtractionEnvSchema = z.object({
	type: z.literal('env'),
	path: z.string(),
});

/**
 * Extraction rule that replaces matches of a regular expression in HAR request/response content.
 * - `property`: The name of the extracted value.
 * - `search`: Regex pattern as a string.
 */
export const WorkHarExtractionRegexSchema = z.object({
	type: z.literal('regex'),
	property: z.string(),
	search: z.string(),
});

/**
 * Extraction rule that replaces exact string matches in HAR content.
 * - `property`: The name of the extracted value.
 * - `search`: The exact string to replace.
 */
export const WorkHarExtractionStringSchema = z.object({
	type: z.literal('string'),
	property: z.string(),
	search: z.string(),
});

/**
 * Union of all valid Workhar extraction rule types: 'env', 'regex', or 'string'.
 */
export const WorkHarExtractionSchema = z.union([
	WorkHarExtractionEnvSchema,
	WorkHarExtractionRegexSchema,
	WorkHarExtractionStringSchema,
]);

/**
 * Array of extraction rules to be applied to HAR files during processing.
 */
export const WorkHarExtractionsSchema = z.array(WorkHarExtractionSchema);

export type WorkHarExtractions = z.infer<typeof WorkHarExtractionsSchema>;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Injections

/**
 * Injection values used to hydrate mustache-style tokens in a HAR file during test mocking.
 * Keys represent token names (e.g., `AUTH_TOKEN`), values are their replacements.
 */
export const WorkHarInjectionSchema = z.record(z.string());