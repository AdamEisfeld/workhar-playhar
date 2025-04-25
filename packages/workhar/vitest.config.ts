import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		coverage: {
			include: [
				'src/**/*.{ts,tsx}',
			],
			exclude: [
				'src/cli.ts',
				'src/errors.ts',
				'src/types.ts',
			],
		}
	},
});
