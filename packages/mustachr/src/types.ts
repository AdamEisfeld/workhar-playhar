import { z } from 'zod';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Extractions

/**
 * Extraction rule that loads environment variables from a `.env` file and replaces their values with template tokens.
 *
 * Example:
 *  If `.env` contains `API_KEY=secret`, and the file contains `secret`,
 *  it will be replaced with `{{ API_KEY }}`.
 */
export const MustachrExtractionEnvSchema = z.object({
	type: z.literal('env'),
	path: z.string(),
});

/**
 * Extraction rule that replaces all matches of a regular expression with a mustache token.
 *
 * - `property`: The name of the token (e.g., `SECRET_TOKEN`).
 * - `search`: The regex pattern or RegExp object to find.
 * - `replace`: A template string that will be used in replacement (can use `{{ property }}` inside).
 */
export const MustachrExtractionRegexSchema = z.object({
	type: z.literal('regex'),
	property: z.string(),
	search: z.string().or(z.instanceof(RegExp)),
	replace: z.string(),
});

/**
 * Extraction rule that replaces all occurrences of a specific string with a mustache token.
 *
 * - `property`: The name of the token (e.g., `URL`).
 * - `search`: Exact string to search for.
 * - `replace`: A template string that can use `{{ property }}` inside.
 */
export const MustachrExtractionStringSchema = z.object({
	type: z.literal('string'),
	property: z.string(),
	search: z.string(),
	replace: z.string(),
});

/**
 * Union schema representing any valid extraction rule.
 * Can be one of: 'env', 'regex', or 'string' based extraction types.
 */
export const MustachrExtractionSchema = z.union([
	MustachrExtractionEnvSchema,
	MustachrExtractionRegexSchema,
	MustachrExtractionStringSchema,
]);

/**
 * Array of extraction rules to apply during file processing.
 */
export const MustachrExtractionsSchema = z.array(MustachrExtractionSchema);

/**
 * Record of key-value pairs used during injection.
 * Keys must match the mustache tokens used in the file (e.g., `SECRET_TOKEN`), and values are what to inject in place.
 */
export type MustachrExtractions = z.infer<typeof MustachrExtractionsSchema>;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Injections

export const MustachrInjectionSchema = z.record(z.string());

export type MustachrInjections = z.infer<typeof MustachrInjectionSchema>;