# workhar-playhar

A monorepo of composable tools to help you record, extract, sanitize, and replay HAR files during end-to-end testing.

This system allows you to:

- Sanitize sensitive values from HAR files
- Extract response JSON into organized fixtures
- Inject values back into those fixtures at runtime (or, test time)
- Mock real network requests using Playwright's `routeFromHAR()`

## Packages

| Package    | Description |
|------------|-------------|
| [`mustachr`](./packages/mustachr) | Extracts or injects values in string files using Mustache-style templates (`{{ TOKEN }}`) |
| [`workhar`](./packages/workhar)   | Converts `.har` files to `.json` fixtures and back |
| [`playhar`](./packages/playhar)   | Ties everything together — record via CLI, then mock HARs during tests |

---

## Example Workflow

### Typical Use

This system is built for **e2e test environments** where you want:

- The reliability of **real API responses**
- The flexibility of **template-based value injection**
- A clean separation between **recording** and **testing**

Use the **CLI** when *recording* — it's fast and easy.
Use the **programmatic API** when *testing* — it's flexible and dynamic.

---

### 1. Configure recording

You can define a config file to guide recording and extraction. Typically you'll use this via the **CLI**, but it’s also usable via code.

```ts
// playhar.config.ts
import { defineConfig } from 'playhar';

export default defineConfig({
  directory: './recordings',
  baseRecordingUrl: 'https://localhost:3000',
  baseRequestUrl: 'https://api.localhost',
  extractions: [
    {
      type: 'regex',
      property: 'AUTH_TOKEN',
      search: '"token":"[^"]+"',
      replace: '"token":"{{ property }}"'
    }
  ]
});
```

This config will:

- Record traffic from `baseRecordingUrl`
- Only save network requests matching `baseRequestUrl`
- Sanitize the HAR by replacing auth tokens with a template variable

---

### 2. Record a session (via CLI)

```bash
npx playhar record
```

This will:

- Ask for a recording name to use for the new recording, eg 'sign-up'
- Launch Playwright in headless mode
- Record all requests to your target backend
- Sanitize and convert the `.har` file into:
  - A sanitized `.har`
  - A `.workhar` map file, used internally
  - A directory of `.json` response payloads, allowing you to tweak the recorded responses with a nicer DX

Alternatively, you can call `playhar.record({...})` from your own setup script.

---

### 3. Use it in your tests (via Code)

Most commonly, you’ll **build a temporary HAR with injected values** before each test. This is done programmatically:

```ts
import { mock, defineInjections, configFromFile } from 'playhar';

const config = await configFromFile({ file: './playhar.config.ts', fallbacks: [] });

const har = await mock({
    name: 'sign-up',
    injections: defineInjections({
        AUTH_TOKEN: 'test-token-123',
    }),
    toHarFile: './temp/mocked.har',
});

await page.routeFromHAR(har);
```

You can now control mock behavior through simple injection files. Easy to swap out per test.

If you prefer the CLI, you can also run:

```bash
npx playhar mock --name sign-up --out ./temp/mocked.har
```

---

## Packages in Detail

### [`mustachr`](./packages/mustachr)

- Extracts sensitive values into `{{ tokens }}`
- Injects replacements for those tokens
- Can run via CLI or code

```ts
import { extract, inject } from 'mustachr';

const output = await extract({ input: rawString, extractions });
const final = inject({ input: output, injections });
```

---

### [`workhar`](./packages/workhar)

- Converts `.har` → `.json` response files + `.workhar` map
- Rebuilds `.har` from `.json` + `.workhar`

```ts
import { har2json, json2har } from 'workhar';

await har2json({ fromHarFile, toWorkharFile, withJsonDirectory });
await json2har({ fromWorkHarFile, withJsonDirectory, toHarFile });
```

---

### [`playhar`](./packages/playhar)

- Record a HAR from live browser session
- Sanitize & extract values with `mustachr`
- Save `.json` responses using `workhar`
- Mock full API session in tests

```ts
import { record, mock } from 'playhar';
```

---

## Testing

Each package is fully unit tested with 100% test coverage. You can run all tests with:

```bash
npm run test
```

Or test an individual package:

```bash
cd packages/playhar
npm run test
```

---

## 🤝 Contributions

PRs welcome! Each package is fully type-safe and tested. If adding a new feature, please include both CLI and programmatic support where possible.

---

## License

MIT
