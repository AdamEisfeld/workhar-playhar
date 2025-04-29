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

## Example: Mocking a Login Flow

Here's how you can use Playhar to record and mock an authenticated login flow, including sensitive data redaction and dynamic token injection.

---

### 1. Install Playhar

```bash
npm install --save-dev playhar
```

### 2. Create `playhar.config.ts`

This config sets up Playhar to record network traffic, extract secrets, and sanitize responses automatically:

```ts
import { defineConfig } from 'playhar';

export default defineConfig({
  directory: './tests/playhar',
  baseRequestUrl: 'https://example.com/api',
  extractions: [
    // Extract secrets from .env.test
    {
      type: 'env',
      path: '.env.test',
    },
    // Extract Bearer auth header tokens
    {
      type: 'regex',
      property: 'BEARER_TOKEN',
      search: '\\bBearer\\s+([A-Za-z0-9\\-_]+\\.[A-Za-z0-9\\-_]+\\.[A-Za-z0-9\\-_]+|\\w{20,})',
      replace: 'Bearer {{ property }}'
    },
    // Extract auth tokens from responses
    {
      type: 'regex',
      property: 'BEARER_TOKEN',
      search: '\\"token\\":\\"[^"]*\\"',
      replace: '"token":"{{ property }}"'
    },
  ],
});
```

### 3. Create a `.env.test` File

Store your real test credentials here:

```
VITE_TEST_EMAIL=johndoe@example.com
VITE_TEST_PASSWORD=cR45H 0V3r1D3
```

These values will be replaced with mustache templates during recording.


### 4. Record a Flow

1. Run your app in development mode:  
```bash
npm run dev
```

2. Start recording:
```bash
npx playhar record
```

3. When prompted:
	- **Recording name**: `login-flow`
	- **URL**: `http://localhost:5173`

4. Playwright will launch a Chromium browser.
5. Click the "Record" button in the Playwright dialog.
6. Complete the login process in your app.
7. Click "Stop Recording" and copy the generated Playwright script (if you want).
8. Click "Continue" to finish recording.

Playhar will automatically sanitize the recorded HAR file and extract all API responses into structured JSON files.

### 5. Create Your Test

Install `jsonwebtoken` to dynamically generate a fake token for your tests:

```bash
npm install jsonwebtoken
```

Then create a Playwright test file like `login.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import * as playhar from 'playhar';
import jwt from 'jsonwebtoken';

test('Login flow', async ({ page }) => {

    // Generate a fake JWT token.
    const token = jwt.sign(
        { userId: '123', email: 'test@example.com' },
        'fake-secret',
        { expiresIn: '1h' }
    );

    // Define dynamic injections for the test
    const injections = playhar.defineInjections({
        BEARER_TOKEN: token,
        VITE_TEST_EMAIL: 'johndoe@example.com',
        VITE_TEST_PASSWORD: 'password',
    });

    // Rebuild the mocked HAR with injected values
    const har = await playhar.mock({
        name: 'login-flow',
        injections,
    });

    // Route all API calls through the mocked HAR
    await page.routeFromHAR(har, {
        url: 'https://example.com/api',
    });

    // Perform the login actions
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Email address' }).fill(injections.VITE_TEST_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(injections.VITE_TEST_PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();

    // Validate success
    await page.waitForTimeout(3000);
    await expect(page.locator('#dom-body')).toContainText('Welcome, John 👋');
});
```

### 6. Result

✅ Your test now mocks the backend, uses dynamic tokens, and **never leaks secrets** into your fixtures!
✅ You can run it **offline**, without relying on a real backend.

---

## Example: Editing Recorded Fixtures

One of Playhar's biggest strengths is that **your API responses are stored as editable JSON files**.

After recording a flow, you can open the extracted JSON files and **modify them manually** to fit your test scenarios.

---

### Modify the HAR JSON fixtures

Suppose you want your test to validate the user's name as "Dade Murphy" instead of the originally recorded "John Doe."

#### **Locate the extracted JSON file(s)**:  
   
```
recordings/
    └── login-flow/
        └── json/
            └── https:/
                └── example.com/
                        └── api/
                            └── auth/
                                └── login_0.json
```

#### **Modify the JSON**:

**Before**:

```json
{
    "statusCode": 200,
    "success": true,
    "message": "User Authorized",
    "token": "{{ BEARER_TOKEN }}",
    "user": {
        "_id": "5fc70d8cf1d4867c0eff5fed7700eff48",
        "firstName": "John",
        "lastName": "Doe",
        ...
    }
}
```

**After**:

```json
{
    "statusCode": 200,
    "success": true,
    "message": "User Authorized",
    "token": "{{ BEARER_TOKEN }}",
    "user": {
        "_id": "5fc70d8cf1d4867c0eff5fed7700eff48",
        "firstName": "Dade", // <-- Updated
        "lastName": "Murphy", // <-- Updated
        ...
    }
}
```

#### **Update your test assertion**:

```ts
await expect(page.locator('#dom-body')).toContainText('Welcome, Dade 👋');
```

---

✅ You didn't need to re-record the flow.  
✅ You didn't have to mock network requests manually.  
✅ You kept the test fast, predictable, and fully offline.

---

## Pro Tip

You can even script changes to your JSON files if you want to generate different test states — like multiple users, different roles, or edge cases.

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
