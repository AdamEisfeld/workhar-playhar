#!/usr/bin/env node

import { run } from './bridge';

try {
	await run(process.argv);
} catch(error) {
	console.error(error);
	process.exit(1);
}
