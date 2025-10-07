# User Management (Register) Page

This project includes a simple User Registration page that sends a registration request to the backend AuthController.

- Endpoint used: `${VITE_API_BASE_URL}/auth/register`
- Method: POST
- Body (JSON): `{ "email": string, "password": string, "name": string, "mobileNumber"?: string, "address"?: string }`
  - Constraints: email max 320 chars (valid format), name max 120, mobileNumber max 32, address max 500. Password: min 6 chars on client (backend requires presence).

## Node.js compatibility

- This repo is pinned to Vite 5 to ensure compatibility with Node 18.x.
- If you prefer to use the latest Vite (v7+), upgrade Node to 20.19+ or 22.12+ first.

### Recommended setups

- Option A (stay on Node 18): just `npm install` and `npm run dev` should work.
- Option B (upgrade Node): install Node 20.19+ (or 22.12+), then you may bump Vite to v7+ if desired.

## Configure API base URL

Set the API base URL via a Vite environment variable. Create a .env file in the project root (or .env.local) and define:

```
VITE_API_BASE_URL=http://localhost:8080
```

If not set, the app defaults to `http://localhost:8080`.

## Run locally

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Open the app in your browser and use the registration form.

## Notes

- The email field is optional on the form; basic validation is included (password match, min length).
- Success and error messages are shown based on the backend response. The client accepts either JSON with a `message` field or plain text responses.

---

Below is the original Vite + React + TypeScript template README for reference.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
