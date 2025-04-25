# Workhar 🛠️

**Workhar** is a CLI and TypeScript library that helps you convert `.har` files into editable `.json` fixtures — and back again.

Designed for use in test environments and mock servers, it allows you to extract JSON responses from network requests into file-based mocks, then rebuild those mocks into usable HAR files when needed.

---

## ✨ Features

- 🔄 Convert `.har` files into structured `.json` response files.
- 🔁 Rebuild `.har` files from those `.json` files, replacing the content.
- 🧠 Smart handling of GraphQL operation names.
- ✅ Fully type-safe with Zod schemas.
- 💯 100% test coverage.

---

## 📦 Installation

```bash
npm install --save-dev workhar
```

Or globally for CLI usage:

```bash
npm install -g workhar
```

---

## 🧠 Core Concepts

- **HAR to JSON**: Extract JSON responses from a HAR file into a directory structure that mirrors the request URLs.
- **JSON to HAR**: Rehydrate a HAR file by injecting content from the corresponding JSON files.

---

## 📁 Example

Given a `.har` file with JSON responses, Workhar will extract each response into a `.json` file like:

```
workhar/json/
  └── https:/
       └── api.example.com/
            └── users/
                 └── getUser_0.json
```

These files can be manually edited, then used to regenerate a new `.har` file via the CLI or API.

---

## 🚀 CLI Usage

```bash
workhar har2json <harFile> <workHarFile> [options]
workhar json2har <workHarFile> <harFile> [options]
```

### Extract HAR → JSON

```bash
workhar har2json ./recording.har ./output/.workhar --json ./output/json
```

### Build HAR ← JSON

```bash
workhar json2har ./output/.workhar ./hydrated.har --json ./output/json
```

---

## 🧰 Programmatic API

```ts
import { har2json, json2har } from 'workhar';

await har2json({
  fromHarFile: './recording.har',
  toWorkharFile: './output/.workhar',
  withJsonDirectory: './output/json',
});

await json2har({
  fromWorkHarFile: './output/.workhar',
  withJsonDirectory: './output/json',
  toHarFile: './hydrated.har',
});
```

---

## 🧠 How It Works

- When extracting from HAR, Workhar:
  - Parses each entry.
  - Skips non-JSON content.
  - Saves each JSON payload into a structured file path based on the request URL.
  - Replaces the HAR response content with the relative JSON file path.

- When rebuilding the HAR:
  - Reads the `.workhar` file and associated `.json` files.
  - Injects the contents back into the HAR response blocks.

---

## 📂 File Outputs

- `.workhar`: Contains the full HAR structure with response content replaced by relative file paths.
- `json/`: Contains extracted response bodies for each request.

---

## 🧪 Testing

Workhar includes complete tests powered by Vitest.

```bash
npm test
```

---

## 🧠 Use Cases

- Reproducible API mocking.
- Isolated frontend development without backend dependency.
- Test fixture generation for end-to-end testing.

---

## 📜 License

MIT © 2025