import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['eslint.config.js', '**/build/**', '**/coverage/**', '**/dist/**', '**/test/**'],
	},
	{
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
			},
		},
		rules: {
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			"@typescript-eslint/no-explicit-any": "error",
		},
	},
	{
		files: ['packages/**/src/**/*.ts'],
	}
);