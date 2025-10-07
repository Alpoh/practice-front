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

## CI: Snapshot workflow on squash-merge to develop

This repository includes a GitHub Actions workflow that creates a snapshot tag and prerelease whenever a pull request into the `develop` branch is merged (squash-merge is the intended flow).

- Trigger: PR closed, merged = true, base = `develop`.
- Tag format: `snapshot-develop-YYYYMMDD-HHMMSS-pr<PR>-<shortSHA>`.
- The tag points to the PR's merge commit SHA; a prerelease with the same tag name is also created.
- Permissions: Uses the default `GITHUB_TOKEN` with `contents: write`.

Notes:
- GitHub does not expose the merge method directly in the workflow payload; this job will run for any merged PR into `develop`. If you only allow squash merges on `develop` (recommended), this precisely matches the requirement.
- You can find the workflow at `.github/workflows/snapshot-on-develop.yml`.

## CI: Release workflow on merge commit to master

A second GitHub Actions workflow creates a GitHub Release whenever a merge commit lands on the `master` branch.

- Trigger: push to `master`.
- Condition: the pushed commit must be a merge commit (detected by multiple parents).
- Tag format: `release-master-YYYYMMDD-HHMMSS-<shortSHA>`.
- Behavior: creates a lightweight tag at the merge commit and publishes a non-prerelease GitHub Release with that tag.
- Permissions: Uses the default `GITHUB_TOKEN` with `contents: write`.
- Location: `.github/workflows/release-on-master-merge.yml`.

Note: The workflow also includes an informational guard job that warns when a direct push to `master` is detected (i.e., no PR is associated). This does not block the push; branch protection must be configured in repository settings to fully enforce the policy.

## Protecting the master branch (required to block direct pushes)

To ensure `master` only accepts changes via Pull Requests and not direct pushes, configure Branch Protection in GitHub:

1. Go to GitHub → Repository → Settings → Branches.
2. Click “Add branch protection rule”.
3. Branch name pattern: `master`.
4. Enable at least:
   - “Require a pull request before merging”.
   - “Require approvals” (optional but recommended, e.g., 1 approval).
   - “Restrict who can push to matching branches” (recommended: limit to admins/bots if needed).
   - “Do not allow bypassing the above settings” (Enterprise/Org setting if available).
   - Optionally enable “Require status checks to pass” and select the CI workflows.
5. Save changes.

After enabling these rules, direct pushes to `master` will be blocked and all changes must come via PRs. The release workflow will run automatically when a PR merge commit reaches `master`. 

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


## Testing

This project uses Vitest + Testing Library for unit tests.

- Run tests in watch mode: `npm run test`
- Run tests once: `npm run test:run`
- Run with coverage: `npm run test:coverage`

Key test files:
- src/__tests__/api.test.ts covers API base URL resolution and registerUser success/error paths.
- src/__tests__/RegisterPage.test.tsx covers form validation and submission behavior.

Vitest is configured in vite.config.ts with the jsdom environment and a setup file at src/setupTests.ts to enable jest-dom matchers.
