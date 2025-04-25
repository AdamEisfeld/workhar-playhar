# Playhar 🎭

**Playhar** is a CLI and TypeScript library that extends the power of [`mustachr`](https://npmjs.com/package/mustachr) and [`workhar`](https://npmjs.com/package/workhar) to help you record, sanitize, and replay API traffic in Playwright tests.

It helps you:

- Record real API traffic using Playwright.
- Replace secrets or dynamic values with `{{ mustache }}` tokens.
- Extract responses into editable `.json` files.
- Rebuild those `.har` files for use with `page.routeFromHAR()`.

---

## Installation

```bash
npm install --save-dev playhar
```

Also ensure you have Playwright installed:

```bash
npm install -D @playwright/test
```

---

## Configuration

playhar requires a config file that defines where recordings should be saved and what extractions to apply.

### Example `playhar.config.ts`

```ts
import { defineConfig } from 'playhar';

export default defineConfig({
  directory: './recordings',
  baseRequestUrl: 'https://api.example.com',
  extractions: [
    {
      type: 'regex',
      property: 'SECRET_TOKEN',
      search: 'token":"[^"]*',
      replace: 'token":"{{ property }}"'
    }
  ],
});
```

This config can be passed to `record()` or `mock()` programmatically, or loaded automatically via the CLI using `--config`.

---

## CLI Usage

```bash
playhar record --url <url> [options]
playhar mock [options]
```

### `playhar record`

Launches a browser, records network traffic to a `.har` file, replaces values using `mustachr`, and extracts `.json` responses using `workhar`.

```bash
playhar record --url http://localhost:5173 --config ./playhar.config.ts
```

You’ll be prompted to name the recording (e.g., `auth-flow`), and specify the URL to open for recording in the browser. Once finished interacting, close the browser to complete the recording and extraction process.

---

### `playhar mock`

Rebuilds a HAR file from extracted JSON responses, optionally injecting values back into mustache tokens.

```bash
playhar mock --config ./playhar.config.ts --name auth-flow --injections ./injections.json --out ./mocked.har
```

You can then use the rebuilt `.har` in a test:

```ts
await page.routeFromHAR('./mocked.har');
```

---

## Programmatic API

```ts
import { record, mock, configFromFile } from 'playhar';

const config = await configFromFile({
  file: './playhar.config.ts',
  fallbacks: [],
});

await record({
  config,
  name: 'auth-flow',
  url: 'http://localhost:5173',
});

await mock({
  config,
  name: 'auth-flow',
  injections: {
    SECRET_TOKEN: 'mocked-token',
  },
  toHarFile: './mocked.har',
});
```

---

## Folder Structure

```
recordings/
  └── auth-flow/
       ├── api.har          ← Extracted & templated HAR
       ├── .workhar         ← Internal mapping file
       └── json/            ← Individual response files
```

---

## File Types

- **.har**: The Playwright-recorded HAR file (sanitized with mustache tokens).
- **.json**: Extracted response bodies for each request.
- **.workhar**: Internal mapping of requests/responses used by Workhar.

---

## Testing

Playhar ships with 100% test coverage using Vitest.

```bash
npm test
```

---

## License

MIT © 2025
