# User Management (Register) Page

This project includes a simple User Registration page that sends a registration request to the backend AuthController.

- Endpoint used: `${VITE_API_BASE_URL}/auth/register`
- Method: POST
- Body (JSON): `{ "email": string, "password": string, "name": string, "mobileNumber"?: string, "address"?: string }`
    - Constraints: email max 320 chars (valid format), name max 120, mobileNumber max 32, address max 500. Password: min
      6 chars on client (backend requires presence).

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

This repository includes a GitHub Actions workflow that creates a snapshot tag and prerelease whenever a pull request
into the `develop` branch is merged (squash-merge is the intended flow).

- Trigger: PR closed, merged = true, base = `develop`.
- Tag format: `snapshot-develop-YYYYMMDD-HHMMSS-pr<PR>-<shortSHA>`.
- The tag points to the PR's merge commit SHA; a prerelease with the same tag name is also created.
- Permissions: Uses the default `GITHUB_TOKEN` with `contents: write`.

Notes:

- GitHub does not expose the merge method directly in the workflow payload; this job will run for any merged PR into
  `develop`. If you only allow squash merges on `develop` (recommended), this precisely matches the requirement.
- You can find the workflow at `.github/workflows/snapshot-on-develop.yml`.

## CI: Release workflow on merge commit to master

A second GitHub Actions workflow creates a GitHub Release whenever a merge commit lands on the `master` branch.

- Trigger: push to `master`.
- Condition: the pushed commit must be a merge commit (detected by multiple parents).
- Tag format: `release-master-YYYYMMDD-HHMMSS-<shortSHA>`.
- Behavior: creates a lightweight tag at the merge commit and publishes a non-prerelease GitHub Release with that tag.
- Permissions: Uses the default `GITHUB_TOKEN` with `contents: write`.
- Location: `.github/workflows/release-on-master-merge.yml`.

Note: The workflow also includes an informational guard job that warns when a direct push to `master` is detected (i.e.,
no PR is associated). This does not block the push; branch protection must be configured in repository settings to fully
enforce the policy.

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

After enabling these rules, direct pushes to `master` will be blocked and all changes must come via PRs. The release
workflow will run automatically when a PR merge commit reaches `master`.

## Notes

- The email field is optional on the form; basic validation is included (password match, min length).
- Success and error messages are shown based on the backend response. The client accepts either JSON with a `message`
  field or plain text responses.

## Despliegue en Azure (guía paso a paso)

A continuación encontrarás dos opciones sencillas para publicar este frontend en Azure. La opción recomendada es Azure Static Web Apps (CI/CD automático con GitHub Actions). Como alternativa, puedes usar Azure Storage Static Website.

Prerrequisitos comunes:
- Node 18+ instalado localmente.
- Una suscripción de Azure activa.
- Acceso al repositorio en GitHub.

### 1) Instalar Azure CLI

Windows (PowerShell):
- winget install -e --id Microsoft.AzureCLI

macOS (Homebrew):
- brew update && brew install azure-cli

Linux (script oficial):
- curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash  (Debian/Ubuntu)
- Otras distros: https://learn.microsoft.com/cli/azure/install-azure-cli

Verifica la instalación:
- az version

Inicia sesión en tu cuenta de Azure:
- az login
- Si tienes varias suscripciones, selecciona una: az account set --subscription "<SUBSCRIPTION_NAME_OR_ID>"

Configura tu grupo de recursos si aún no existe (ejemplo en East US):
- az group create -n rg-pratice-front -l eastus

### 2) Opción A (recomendada): Azure Static Web Apps con CI/CD

Este repositorio ya incluye:
- .github/workflows/azure-static-web-apps.yml → construye (npm ci; npm run build) y publica dist.
- staticwebapp.config.json → asegura que el enrutamiento SPA haga fallback a index.html.

Pasos:
1. Crea el recurso Static Web App (portal o CLI):
   - Portal: Azure Portal → Create a resource → Static Web App → selecciona GitHub como origen (o crea manual y obtén el token de despliegue).
   - CLI (opcional, primer despliegue manual):
     az staticwebapp create \
       -n swa-pratice-front \
       -g rg-pratice-front \
       -s https://github.com/<ORG>/<REPO> \
       -l eastus \
       --branch master \
       --login-with-github false
   Nota: Si no conectas GitHub desde el portal, necesitarás el Deployment Token.

2. Obtén el Deployment Token de la Static Web App (en el portal: Static Web App → Deployment token).
3. En GitHub → Settings → Secrets and variables → Actions → New repository secret
   - Nombre: AZURE_STATIC_WEB_APPS_API_TOKEN
   - Valor: pega el token copiado del portal.
4. Realiza un push a master (o abre un PR a master). El workflow azure-static-web-apps.yml construirá y publicará automáticamente.
5. Configura variables para el frontend (por ejemplo VITE_API_BASE_URL) en la Static Web App:
   - En el portal: Static Web App → Configuration → Application settings → agrega VITE_API_BASE_URL con el valor de tu API.
   - Vuelve a desplegar (o espera el próximo push) para que el build las tome.

Ramas y previews:
- En pull requests hacia master, el workflow crea entornos de preview.
- Al cerrar el PR, se manda la acción "close" para limpiar el entorno de preview.

### 3) Opción B: Azure Storage Static Website (alternativa económica)

1. Crea una cuenta de Storage y habilita sitio estático:
   - az storage account create -n stpraticefront123 -g rg-pratice-front -l eastus --sku Standard_LRS
   - az storage blob service-properties update --account-name stpraticefront123 --static-website --index-document index.html --404-document index.html
2. Construye el sitio localmente:
   - npm ci && npm run build (genera la carpeta dist)
3. Sube los archivos a $web (contenedor especial):
   - az storage blob upload-batch -s ./dist -d '$web' --account-name stpraticefront123
4. Obtén la URL pública:
   - az storage account show -n stpraticefront123 -g rg-pratice-front --query "primaryEndpoints.web" -o tsv

Variables de entorno en Storage Static Website:
- Como es hosting estático puro, las variables deben resolverse en build time. Define VITE_API_BASE_URL antes de construir:
  - En tu CI/CD o localmente: VITE_API_BASE_URL="https://tu-api" npm run build

### 4) Manejar Azure en este mismo repo o en uno nuevo

- Mismo repo: Recomendado para frontends; este repo ya trae el workflow para Static Web Apps. Solo agrega el secreto y listo.
- Repo nuevo: Si prefieres separar infra/CI, puedes crear un repo "infra" con IaC (Bicep/Terraform) y dejar este repo solo para código. En ese caso, el repo de infra creará el recurso de Static Web App y colocará el token como secret en este repo via GitHub API.

### 5) Solución de problemas

- 404 en rutas SPA: ya se agregó staticwebapp.config.json con fallback a index.html.
- Error de CORS al llamar la API: habilita CORS en tu backend o usa un API Management/función intermedia.
- Variable VITE_API_BASE_URL no tomada: en Static Web Apps las variables se aplican en build. Asegúrate de que el build se ejecute después de definirlas.

---

Below is the original Vite + React + TypeScript template README for reference.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react)
  uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used
  in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc)
  uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it,
see [this documentation](https://react.dev/learn/react-compiler/installation).

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

You can also
install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x)
and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom)
for React-specific lint rules:

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

Vitest is configured in vite.config.ts with the jsdom environment and a setup file at src/setupTests.ts to enable
jest-dom matchers.

## JetBrains Code Style: Google TypeScript

This project includes a JetBrains/IntelliJ code style scheme for TypeScript that follows Google-style conventions (
2-space indentation, single quotes, required semicolons, etc.).

- Location: `.idea/codeStyles/GoogleTypeScript.xml`
- Enabled via: `.idea/codeStyles/codeStyleConfig.xml` (per-project settings, preferred scheme set to
  `GoogleTypeScript`).

Usage in JetBrains IDEs (WebStorm/IntelliJ IDEA):

- Open Settings/Preferences → Editor → Code Style.
- Ensure "Use per-project settings" is enabled and the scheme is set to `GoogleTypeScript`.
- Press "Apply". Existing files can be reformatted with "Code → Reformat Code".
