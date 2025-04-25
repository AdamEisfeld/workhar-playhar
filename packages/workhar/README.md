# Workhar

**Workhar** is an open-source CLI and TypeScript library for converting `.har` files into editable `.json` response fixtures — and back again.

Designed for use in test environments and mock servers, it allows you to extract JSON responses from HAR file network requests into individual .json files, then rebuild those .json files into usable HAR files when needed.

---

## Installation

Install locally for programmatic or project-level CLI use:

```bash
npm install --save-dev workhar
```

Or install globally to use the CLI anywhere:

```bash
npm install -g workhar
```

---

## Concepts

Workhar supports two operations:

### HAR → JSON (`har2json`)

- Extracts JSON responses from a `.har` file
- Replaces the HAR content with a relative file path
- Saves original response bodies in `json/` as individual files
- Stores the full HAR structure in a `.workhar` file

### JSON → HAR (`json2har`)

- Reads a `.workhar` file and matching `json/` files
- Injects content back into the HAR responses
- Outputs a rebuilt HAR file ready for mocking

---

## Example File Structure

After extraction:

```
output/
├── .workhar
└── json/
    └── https:/
        └── api.example.com/
            └── users/
                └── getUser_0.json
```

You can edit the `.json` files directly, then regenerate a new HAR using the `.workhar` map.

---

## CLI Usage

```bash
workhar har2json <harFile> <workHarFile> [options]
workhar json2har <workHarFile> <harFile> [options]
```

### HAR → JSON

```bash
workhar har2json ./recording.har ./output/.workhar --json ./output/json
```

### JSON → HAR

```bash
workhar json2har ./output/.workhar ./hydrated.har --json ./output/json
```

---

## Programmatic API

```ts
import { har2json, json2har } from 'workhar';

// Convert HAR to editable .json responses
await har2json({
  fromHarFile: './recording.har',
  toWorkharFile: './output/.workhar',
  withJsonDirectory: './output/json',
});

// Rebuild HAR from modified JSON
await json2har({
  fromWorkharFile: './output/.workhar',
  withJsonDirectory: './output/json',
  toHarFile: './hydrated.har',
});
```

---

## File Outputs

- **`.workhar`**: A structured JSON representation of the original HAR with response bodies replaced by file paths
- **`json/`**: The extracted responses, organized by request URL and operation

---

## How It Works

### When extracting:
- Reads the HAR entries
- Skips non-JSON responses
- For GraphQL, appends the operation name to the output path
- Saves each JSON response to a file, and replaces the original response in the HAR with its relative path

### When rebuilding:
- Loads the `.workhar` map and `json/` responses
- Replaces the relative file paths in the HAR with actual JSON content
- Produces a new HAR file with real responses

---

## Testing

Workhar is fully tested with [Vitest](https://vitest.dev/):

```bash
npm run test
```

---

## Use Cases

- Redacting or editing HAR files for sharing
- Easier modification of HAR files
- Replacing HAR content at runtime or test-time
- E2E testing with deterministic mock data

---

## License

MIT © 2025
