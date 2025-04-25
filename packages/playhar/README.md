# Playhar 🎭

**Playhar** is a CLI and TypeScript library that extends the power of [Mustachr](https://npmjs.com/package/mustachr) and [Workhar](https://npmjs.com/package/workhar) by integrating them into a developer-friendly workflow for recording, templating, and mocking API traffic in your Playwright tests.

It helps you:

- Record HAR files from real browser sessions.
- Replace secrets or variable values with mustache-style templates.
- Extract and store response data as editable `.json` files.
- Rebuild those HAR files on demand for use with `page.routeFromHAR()`.

---

## ✨ Features

- 🎥 Record real interactions using Playwright.
- 🧩 Replace dynamic or secret values with template tokens.
- 🧪 Extract and store JSON responses as test fixtures.
- 🔁 Mock exact API responses in Playwright tests.
- 📦 Built on top of `mustachr` and `workhar`.

---

## 📦 Installation

```bash
npm install --save-dev playhar
```

Also ensure you have Playwright installed:

```bash
npm install -D @playwright/test
```

---

## ⚙️ Configuration

Create a `playhar.config.ts` file:

```ts
import { defineConfig } from 'playhar';

export default defineConfig({
  directory: './recordings',
  baseRecordingUrl: 'http://localhost:5173',
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

---

## 🚀 CLI Usage

```bash
playhar record [options]
playhar mock [options]
```

### 🔴 `playhar record`

Records a HAR file while you interact with a webpage, extracts response JSONs, and templates secrets.

```bash
playhar record --config ./playhar.config.ts
```

You’ll be prompted to name the recording. Playwright will launch a browser session. Once you finish interacting, close the browser to complete the recording.

---

### 🧪 `playhar mock`

Rebuilds a mock HAR file from the previously extracted JSON files.

```bash
playhar mock --config ./playhar.config.ts --name my-recording --injections ./injections.json --out ./mocked.har
```

This HAR file can now be used in Playwright tests:

```ts
await page.routeFromHAR('./mocked.har');
```

---

## 🧰 Programmatic API

```ts
import { record, mock, configFromFile } from 'playhar';

const config = await configFromFile({ file: './playhar.config.ts', fallbacks: [] });

await record({
  config,
  name: 'auth-flow',
});

await mock({
  config,
  name: 'auth-flow',
  injections: {
    SECRET_TOKEN: 'abc123',
  },
  toHarFile: './mocked.har',
});
```

---

## 📁 Folder Structure

```
recordings/
  └── auth-flow/
       ├── api.har          ← Extracted & templated HAR
       ├── .workhar         ← Internal mapping file
       └── json/            ← Individual response files
```

---

## ✅ Perfect For

- 🔬 Playwright test mocking
- 🔁 Replaying backend interactions locally
- 🔐 Masking secrets from test fixtures
- 💻 Frontend-only development

---

## 🧪 Testing

Playhar ships with 100% test coverage. Run tests with:

```bash
npm test
```

---

## 📜 License

MIT © 2025