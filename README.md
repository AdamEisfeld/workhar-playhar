# Workhar Playhar Monorepo

This monorepo contains three related libraries that work together to help you record, sanitize, extract, and replay HTTP API traffic in your tests:

| Package    | Description |
|------------|-------------|
| [`mustachr`](./packages/mustachr) | Extracts or injects values in string files using Mustache-style templates (`{{ TOKEN }}`) |
| [`workhar`](./packages/workhar)   | Converts `.har` files to `.json` fixtures and back |
| [`playhar`](./packages/playhar)   | Ties everything together — record via CLI, then mock HARs during tests |

---

### 🎭 Playhar – Record, Template, and Replay HARs in Playwright

[`playhar`](https://www.npmjs.com/package/playhar) is the core workflow layer that ties everything together.

It launches a real Playwright browser, records API traffic into a `.har` file, sanitizes sensitive values with mustache-style templates, and extracts response bodies into editable `.json` fixtures. These can then be rebuilt into usable HARs and replayed with `page.routeFromHAR()` in your tests.

##### Install

```bash
npm install --save-dev playhar
```

Also ensure you have Playwright installed:

```bash
npm install -D @playwright/test
```

##### Example Config (`playhar.config.ts`)

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

##### CLI Usage

```bash
playhar record --url http://localhost:5173 --config ./playhar.config.ts
playhar mock --name auth-flow --injections ./injections.json --out ./mocked.har
```

##### Programmatic Usage

```ts
import { record, mock, configFromFile } from 'playhar';

const config = await configFromFile({ file: './playhar.config.ts', fallbacks: [] });

await record({ config, name: 'auth-flow', url: 'http://localhost:5173' });

await mock({
  config,
  name: 'auth-flow',
  injections: { SECRET_TOKEN: 'mocked-token' },
  toHarFile: './mocked.har',
});
```

---

### Workhar – Convert HAR Files to JSON and Back

[`workhar`](https://www.npmjs.com/package/workhar) is the engine that powers Playhar’s extraction and hydration process. It turns `.har` files into structured `.json` files you can edit, and then regenerates HARs from those responses.

##### Install

```bash
npm install --save-dev workhar
```

##### CLI Usage

```bash
workhar har2json ./recording.har ./.workhar --json ./json
workhar json2har ./.workhar ./hydrated.har --json ./json
```

##### Programmatic Usage

```ts
import { har2json, json2har } from 'workhar';

await har2json({
  fromHarFile: './recording.har',
  toWorkharFile: './.workhar',
  withJsonDirectory: './json',
});

await json2har({
  fromWorkHarFile: './.workhar',
  withJsonDirectory: './json',
  toHarFile: './hydrated.har',
});
```

---

### 🥸 Mustachr – Template and Inject Mustache Files

[`mustachr`](https://www.npmjs.com/package/mustachr) lets you extract hardcoded secrets or values from text files and replace them with mustache-style template tokens (like `{{ SECRET }}`). You can later inject them back using an injection map.

##### Install

```bash
npm install --save-dev mustachr
```

##### CLI Usage

```bash
mustachr extract ./api.har --extractions ./mustachr.extractions.ts
mustachr inject ./api.har --injections ./mustachr.injections.ts
```

##### Programmatic Usage

```ts
import { extract, inject, defineExtractions, defineInjections } from 'mustachr';

const extracted = await extract({
  input: fs.readFileSync('./api.har', 'utf-8'),
  extractions: defineExtractions([
    {
      type: 'string',
      property: 'SECRET',
      search: 'SuperSecret123',
      replace: '{{ property }}',
    },
  ]),
});

const hydrated = inject({
  input: extracted,
  injections: defineInjections({ SECRET: 'MockedValue' }),
});
```

---

### Testing

All packages are 100% test-covered and tested with [Vitest](https://vitest.dev/). Run all tests from the monorepo root:

```bash
npm run test
```

---

### Repository Structure 📂

```
workhar-playhar/
  ├── packages/
  │   ├── mustachr/
  │   ├── workhar/
  │   └── playhar/
  ├── README.md
  ├── turbo.json
  └── ...
```

---

## License

MIT © 2025 Adam Eisfeld
