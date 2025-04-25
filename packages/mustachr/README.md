# Mustachr 🥸

**Mustachr** is a lightweight CLI and TypeScript library for extracting and injecting values in structured files using Mustache-style templates.

It lets you sanitize sensitive data by replacing it with template tokens, or inject dynamic values into templated files. Mustachr is especially useful for test fixture sanitization, API mocking, and configuration management.

---

## ✨ Features

- 🔍 Extract environment variables, string literals, or regex patterns into `{{ mustache }}` tokens.
- 💉 Inject values back into templated files using a JSON or JS/TS map.
- ✅ 100% test coverage.
- ⚙️ CLI and programmatic API support.

---

## 📦 Installation

```bash
npm install --save-dev mustachr
```

Or globally for CLI use:

```bash
npm install -g mustachr
```

---

## 🧠 Basic Concepts

Mustachr supports **extraction** and **injection**:

- **Extraction**: Replaces matching values in a file with `{{ token }}` placeholders.
- **Injection**: Replaces `{{ token }}` placeholders with actual values.

---

## 📁 Example

### Input file (`example.txt`):

```json
{
  "apiKey": "SuperSecret123",
  "user": "admin"
}
```

### Extractions file (`mustachr.extractions.ts`):

```ts
import { defineExtractions } from 'mustachr';

export default defineExtractions([
  {
    type: 'string',
    property: 'API_KEY',
    search: 'SuperSecret123',
    replace: '{{ property }}',
  },
]);
```

### After Extraction:

```json
{
  "apiKey": "{{ API_KEY }}",
  "user": "admin"
}
```

### Injections file (`mustachr.injections.ts`):

```ts
import { defineInjections } from 'mustachr';

export default defineInjections({
  API_KEY: 'Mocked1234'
});
```

### After Injection:

```json
{
  "apiKey": "Mocked1234",
  "user": "admin"
}
```

---

## 🚀 CLI Usage

```bash
mustachr extract <file> [options]
mustachr inject <file> [options]
```

### Extract

```bash
mustachr extract ./example.txt --extractions ./mustachr.extractions.ts --out ./output.txt
```

### Inject

```bash
mustachr inject ./output.txt --injections ./mustachr.injections.ts --out ./hydrated.txt
```

---

## 🧰 Programmatic API

```ts
import { extract, inject, defineExtractions, defineInjections } from 'mustachr';

const result = await extract({
  input: 'key=SuperSecret123',
  extractions: defineExtractions([
    {
      type: 'string',
      property: 'API_KEY',
      search: 'SuperSecret123',
      replace: '{{ property }}',
    },
  ]),
});

const final = inject({
  input: result,
  injections: defineInjections({ API_KEY: 'Mocked1234' }),
});
```

---

## 📂 File Formats

Mustachr supports `.ts`, `.js`, or `.json` extraction/injection files. In `.ts` or `.js`, export your config using `defineExtractions()` or `defineInjections()`.

---

## 🧪 Testing

Mustachr includes 100% test coverage using Vitest. Run tests with:

```bash
npm test
```

---

## 🧠 Use Cases

- Redacting secrets from HAR/API fixtures.
- Injecting test data into static files.
- Templating configuration files for CI/CD.

---

## 📜 License

MIT © 2025
