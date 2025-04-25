import * as mustachr from './mustachr.js';
import { Command } from 'commander';
import fs from 'fs';
import pkg from '../package.json' assert { type: 'json' };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: CLI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const run = (argv: string[] = process.argv) => {

	return new Promise<void>((resolve, reject) => {

		const program = new Command();

		program
			.name('mustachr')
			.description(pkg.description)
			.version(pkg.version);

		program
			.command('extract')
			.description('Replaces matching patterns in a file with Mustache-style template variables.')
			.argument('<file>', 'Path to the input file to transform')
			.option(
				'-e, --extractions <path>',
				'Path to an extractions config file (.ts, .js, or .json) defining patterns to extract'
			)
			.option(
				'-o, --out <path>',
				'Optional path to write the transformed output (default: overwrite input file)'
			)
			.action(async (file: string, options: { extractions?: string; out?: string }) => {

				try {
			
					const {
						extractions: extractionsFile,
						out: outFile,
					} = options;
			
					const extractions = await mustachr.extractionsFromFile({
						file: extractionsFile,
						fallbacks: [
							'./mustachr.extractions.ts',
							'./mustachr.extractions.js',
							'./mustachr.extractions.json',
						]
					});
			
					if (extractions.length === 0) {
						throw new mustachr.errors.MustachrErrorNoExtractionsFound({
							extractionsFilePath: extractionsFile,
						});
					}
	
					const input = fs.readFileSync(file, 'utf-8');
					
					const output = await mustachr.extract({
						input,
						extractions,
					});
	
					if (outFile) {
						fs.writeFileSync(outFile, output, 'utf-8');
					} else {
						fs.writeFileSync(file, output, 'utf-8');
					}
	
					resolve();

				} catch(error) {
					reject(error);
				}

			});

		program
			.command('inject')
			.description('Replaces Mustache-style template variables in a file with real values.')
			.argument('<file>', 'Path to the input file containing template variables')
			.option(
				'-i, --injections <path>',
				'Path to an injections file (.ts, .js, or .json) defining variable replacements'
			)
			.option(
				'-o, --out <path>',
				'Optional path to write the final output (default: overwrite input file)'
			)
			.action(async (file: string, options: { injections?: string; out?: string }) => {

				try {
			
					const {
						injections: injectionsFile,
						out: outFile,
					} = options;
			
					const injections = await mustachr.injectionsFromFile({
						file: injectionsFile,
						fallbacks: [
							'./mustachr.injections.ts',
							'./mustachr.injections.js',
							'./mustachr.injections.json',
						]
					});
			
					if (Object.keys(injections).length === 0) {
						throw new mustachr.errors.MustachrErrorNoInjectionsFound({
							injectionsFilePath: injectionsFile,
						});
					}
	
					const input = fs.readFileSync(file, 'utf-8');
	
					const output = mustachr.inject({
						input,
						injections,
					});
	
					if (outFile) {
						fs.writeFileSync(outFile, output, 'utf-8');
					} else {
						fs.writeFileSync(file, output, 'utf-8');
					}
	
					resolve();
					
				} catch(error) {
					reject(error);
				}
				
			});

		program.parse(argv);
		
	});

};
