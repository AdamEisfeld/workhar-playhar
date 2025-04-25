import { Command } from 'commander';
import * as workhar from './workhar';
import pkg from '../package.json' assert { type: 'json' };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: CLI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const run = (argv: string[] = process.argv) => {

	return new Promise<void>((resolve, reject) => {

		const program = new Command();

		program
			.name('workhar')
			.description(pkg.description)
			.version(pkg.version);

		program
			.command('har2json')
			.description('Extracts JSON responses from a HAR file and saves them as standalone files.')
			.argument('<harFile>', 'Path to the original HAR file')
			.argument('<workHarFile>', 'Path to output the .workhar metadata file')
			.option(
				'-j, --json <dir>',
				'Directory to save extracted JSON files (default: ./workhar/json)',
				'./workhar/json'
			)
			.action(async (harFile, workHarFile, options) => {

				try {

					const {
						json: withJsonDirectory,
					} = options;
			
					await workhar.har2json({
						fromHarFile: harFile,
						toWorkharFile: workHarFile,
						withJsonDirectory,
					});
	
					resolve();

				} catch(error) {
					reject(error);
				}

			});

		program
			.command('json2har')
			.description('Rebuilds a HAR file by injecting JSON response files into it.')
			.argument('<workHarFile>', 'Path to the .workhar file created during har2json')
			.argument('<harFile>', 'Output path for the rebuilt HAR file')
			.option(
				'-j, --json <dir>',
				'Directory containing JSON files to inject (default: ./workhar/json)',
				'./workhar/json'
			)
			.action(async (workHarFile, harFile, options) => {

				try {

					const {
						json: withJsonDirectory,
					} = options;
			
					await workhar.json2har({
						fromWorkHarFile: workHarFile,
						withJsonDirectory,
						toHarFile: harFile,
					});
	
					resolve();

				} catch(error) {
					reject(error);
				}


			});

		program.parse(argv);
		
	});

};
