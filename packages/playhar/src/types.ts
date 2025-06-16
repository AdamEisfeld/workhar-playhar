import { z } from 'zod';
import * as mustachr from '@adameisfeld/mustachr';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: Internal Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Extractions

/**
 * Schema representing the Playhar configuration object.
 * This defines how and where HAR recordings are made and processed.
 *
 * Properties:
 * - `directory`: Root folder where recordings and extracted files are stored.
 * - `baseRequestUrl`: A URL filter to determine which requests should be recorded into the HAR.
 * - `extractions`: An array of Mustachr extraction rules used to sanitize/extract sensitive or dynamic values in the HAR.
 */
export const PlayharConfigSchema = z.object({
	directory: z.string(),
	baseRequestUrl: z.string(),
	defaultRecordingUrl: z.string().optional(),
	extractions: mustachr.types.MustachrExtractionsSchema,
});

export type PlayharConfig = z.infer<typeof PlayharConfigSchema>;