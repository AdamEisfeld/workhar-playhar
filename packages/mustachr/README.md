# Mustachr 🥸

**Mustachr** is a lightweight, open-source CLI and TypeScript library for extracting and injecting values in structured files using Mustache-style templates.

It lets you sanitize sensitive data by replacing it with template tokens, or inject dynamic values into templated files. mustachr is especially useful for test fixture sanitization, API mocking, and configuration management.

---

## Installation

```bash
npm install --save-dev mustachr
```

Or globally for CLI use:

```bash
npm install -g mustachr
```

---

## Concepts

Mustachr supports two primary operations:

- **Extraction**: Replaces matching values in a file with `{{ TOKEN }}` placeholders
- **Injection**: Replaces `{{ TOKEN }}` placeholders with actual values

---

## 📁 Example

### Input file (`example.txt`)

```json
{
  "apiKey": "SuperSecret123",
  "user": "admin"
}
```

### Extractions file (`mustachr.extractions.ts`)

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

### After Extraction

```json
{
  "apiKey": "{{ API_KEY }}",
  "user": "admin"
}
```

### Injections file (`mustachr.injections.ts`)

```ts
import { defineInjections } from 'mustachr';

export default defineInjections({
  API_KEY: 'Mocked1234'
});
```

### After Injection

```json
{
  "apiKey": "Mocked1234",
  "user": "admin"
}
```

---

## Configuration 🛠️

Mustachr uses two configuration files:

- **Extractions File**: Defines how values should be matched and replaced (for sanitization)
- **Injections File**: Defines values to replace `{{ tokens }}` (for hydration)

These can be written as `.ts`, `.js`, or `.json` files and exported using `defineExtractions()` or `defineInjections()`:

```ts
// mustachr.extractions.ts
import { defineExtractions } from 'mustachr';

export default defineExtractions([ /* extractions here */ ]);
```

```ts
// mustachr.injections.ts
import { defineInjections } from 'mustachr';

export default defineInjections({ /* injections here */ });
```

The CLI will automatically pick up these files if named:

- `mustachr.extractions.ts|js|json`
- `mustachr.injections.ts|js|json`

Or you can specify them manually via `--extractions` and `--injections`.

---

## Extraction Types

mustachr supports three types of extractions: `string`, `regex`, and `env`.

### `string 🔤` Extraction

Matches exact string values and replaces them with tokens.

```ts
{
  type: 'string',
  property: 'API_KEY',
  search: 'SuperSecret123',
  replace: '{{ property }}'
}
```

Replaces `"SuperSecret123"` with `{{ API_KEY }}`

---

### `regex 🧪` Extraction

Matches patterns using regular expressions.

```ts
{
  type: 'regex',
  property: 'TOKEN',
  search: 'token=[a-zA-Z0-9]+',
  replace: 'token={{ property }}'
}
```

Replaces `"token=abcd1234"` with `"token={{ TOKEN }}"`

---

### `env 📦` Extraction

Reads values from a `.env` file and replaces matching values in the target file.

```ts
{
  type: 'env',
  path: './.env'
}
```

If `.env` contains:

```env
API_KEY=SuperSecret123
DB_PASSWORD=Hunter2
```

Then any matching strings in the input file are replaced with `{{ API_KEY }}` and `{{ DB_PASSWORD }}` respectively.


---

## CLI Usage

You can use mustachr from the command line to extract or inject values in any file:

```bash
mustachr extract <file> [options]
mustachr inject <file> [options]
```

### Extract Example

```bash
mustachr extract ./example.txt --extractions ./mustachr.extractions.ts --out ./output.txt
```

### Inject Example

```bash
mustachr inject ./output.txt --injections ./mustachr.injections.ts --out ./hydrated.txt
```

> If `--extractions` or `--injections` are omitted, mustachr will look for default files like `mustachr.extractions.ts` in the current directory.

---

## Programmatic API

You can use mustachr directly in code:

```ts
import { extract, inject, defineExtractions, defineInjections } from 'mustachr';

const sanitized = await extract({
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

const hydrated = inject({
  input: sanitized,
  injections: defineInjections({ API_KEY: 'Mocked1234' }),
});
```

---

## Testing

Mustachr is fully covered with unit tests using [Vitest](https://vitest.dev/):

```bash
npm run test
```

---

## Use Cases

- Redacting secrets in HAR files or other structured test artifacts
- Injecting dynamic data into mock API responses
- Generating reproducible test fixtures
- Cleaning up sensitive config before sharing

---

## License

MIT © 2025
