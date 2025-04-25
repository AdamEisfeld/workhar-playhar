import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		isolate: true,
		coverage: {
			include: [
				'src/**/*.{ts,tsx}',
			],
			exclude: [
				'src/cli.ts',
				'src/errors.ts',
				'src/types.ts',
			],
			reporter: ['text', 'json-summary', 'lcov'],
			reportsDirectory: './coverage',
		}
	},
});
