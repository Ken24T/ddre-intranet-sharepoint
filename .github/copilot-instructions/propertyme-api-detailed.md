# Copilot Instructions — DDRE Intranet (PropertyMe API Integration)

> Purpose: Provide GitHub Copilot with repo-specific guidance to generate consistent, secure, testable **React + TypeScript** code for integrating the **PropertyMe API** using **OAuth 2.0 Authorisation Code** flow.

---

## 1) Context and goals

- This repo (“DDRE Intranet”) is a **React + TypeScript** application.
- It integrates with **PropertyMe APIs** for **read operations** on:
  - contacts, properties, activities, communications, transactions.
- Authentication uses **OAuth 2.0 Authorisation Code** against the **PropertyMe Identity Service**.
- Tokens:
  - `access_token` lifetime ≈ **30 minutes**.
  - `refresh_token` may be issued when `offline_access` scope is granted; it is long-lived and used to mint new access tokens.

### Non-goals

- Do not implement non-standard OAuth flows.
- Do not store secrets or tokens in source control.
- Do not call PropertyMe APIs directly from unauthenticated client-side code.

---

## 2) Security rules (must follow)

- **NEVER** hardcode or commit:
  - `client_secret`, `client_id`, tokens, or authorisation codes.
- Secrets must be provided via **environment variables** or **server-side configuration** only:
  - `PROPERTYME_CLIENT_ID`
  - `PROPERTYME_CLIENT_SECRET`
  - `PROPERTYME_REDIRECT_URI`
  - optionally `PROPERTYME_SCOPES`
- In React:
  - `client_secret` must **never** be exposed to browser bundles.
  - OAuth token exchange and refresh must occur **server-side** (API route / backend service).
- Never log secrets or raw tokens.
  - Logging may include token expiry timestamps and correlation IDs only.

---

## 3) Deployment context (SharePoint + SPFx + local Vite dev)

- Target deployment is **SharePoint Online (DDRE tenant)** using **SPFx packages**.
- The intranet will consist of multiple SPFx solutions/apps (e.g. **PM Dashboard**).
- SharePoint environment is not available yet, so development currently uses:
  - **Vite** (`npx`/`npm`) for a local dev server and fast iteration.
  - **mocked data** for UI and workflow development.

### Critical constraint (SPFx)

- SPFx code runs in the **browser** (even though it’s “SharePoint”), therefore:
  - `client_secret` must **never** be shipped in SPFx bundles.
  - OAuth token exchange/refresh and token storage must be **server-side**.

### Recommended production pattern for SPFx

- SPFx (client) calls **your own backend** (tenant-controlled) which:
  - performs OAuth (authorisation code exchange and refresh)
  - stores tokens securely
  - proxies PropertyMe API calls

Backend options (choose one; Copilot must not assume secrets in SPFx):

✅ **Selected for DDRE:** **Option A — Azure Functions (HTTP-trigger) using TypeScript**

Copilot must generate code assuming:
- A **Function App** (Functions v4) written in **TypeScript**.
- Deployed in DDRE Azure tenant and protected with **Microsoft Entra ID (AAD)**.
- SPFx calls the Functions endpoints using SharePoint/Entra auth.

---

## 4) Architecture expectations (important)

Copilot must assume a **split architecture**:

### Client (SPFx in SharePoint)

- SPFx may be built with React, but Copilot should treat it as **SPFx client-side** code with SharePoint constraints.

- Handles:
  - initiating login (redirect user to internal `/api/propertyme/authorize`)
  - rendering UI and data
  - calling internal endpoints (your backend/proxy) for data
- Must **not**:
  - exchange codes for tokens
  - store tokens in localStorage/sessionStorage
  - call PropertyMe APIs directly

### Server (required: proxy/backend)

One of these MUST exist for production:

- **Option A (recommended for SharePoint):** Azure Functions / App Service API within DDRE tenant
- **Option B:** Separate internal web service (Node/ASP.NET) reachable from SharePoint

The server component handles:
- OAuth code exchange
- token refresh
- token storage
- all calls to PropertyMe APIs

### Local development (Vite)

For local dev, Copilot should support a **local backend proxy** running alongside Vite:

- React app runs at Vite origin (e.g. `http://localhost:5173`)
- Proxy/API runs at another local port (e.g. `http://localhost:8787`)
- Vite `server.proxy` should route `/api/*` to the local proxy so the client code always calls `/api/...`.

---

## 4) API endpoints and base URLs

- Authorise endpoint:
  - `https://login.propertyme.com/connect/authorize`
- Token endpoint:
  - `https://login.propertyme.com/connect/token`
- PropertyMe API Swagger UI:
  - `https://app.propertyme.com/api/swagger-ui/#/`

---

## 5) Required repo structure (TypeScript / SPFx + Azure Functions)

When generating new code, follow this structure (adjust to match repo conventions). If the repo is later converted into a formal SPFx solution structure, keep the same separation of concerns.

```
/src
  /propertyme
    /config
      propertymeConfig.ts
    /oauth
      oauthClient.ts
      tokenModels.ts
      tokenStore.ts
    /http
      propertymeClient.ts
      errors.ts
    /api
      contacts.ts
      properties.ts
      activities.ts
      communications.ts
      transactions.ts

  /spfx
    /webparts
      /pmDashboard
        PMDashboardWebPart.ts
        components/
          PMDashboard.tsx
          PropertyMeConnectButton.tsx

  /mocks
    /propertyme
      contacts.mock.json
      properties.mock.json

/azure-functions
  /propertyme-api
    /src
      /functions
        authorize.ts         // GET /api/propertyme/authorize
        callback.ts          // GET /api/propertyme/callback
        contacts.ts          // GET /api/propertyme/contacts
        properties.ts        // GET /api/propertyme/properties
        activities.ts        // GET /api/propertyme/activities
        communications.ts    // GET /api/propertyme/communications
        transactions.ts      // GET /api/propertyme/transactions
      /lib
        config.ts
        oauthClient.ts
        tokenStore.ts
        propertymeClient.ts
        errors.ts
        stateStore.ts        // CSRF state + nonce storage/validation
    host.json
    local.settings.json (DO NOT COMMIT)
    package.json
    tsconfig.json
```

Notes for Copilot:
- `src/spfx/*` is the **SPFx client** (runs in browser).
- `/azure-functions/propertyme-api/*` is the **production backend** (server-side). This is where OAuth + PropertyMe calls happen.
- During local dev:
  - Run Vite for the UI and **Azure Functions Core Tools** for the backend.
  - Use a Vite dev proxy so the React/SPFx-like code always calls `/api/...`.

### Tooling assumptions

- Language: **TypeScript (strict mode)**
- Runtime: **Node.js 18+**
- HTTP client: **fetch** or **axios**
- Testing: **Vitest** or **Jest**
- Linting/formatting: repo defaults (eslint / prettier)

---

## 6) Implementation conventions

### 6.1 Configuration

- Implement `PropertyMeConfig` (server-side) with strict validation:
  - `clientId`, `clientSecret`, `redirectUri`, `scopes`
- In Azure Functions, load via environment variables / app settings:
  - `PROPERTYME_CLIENT_ID`
  - `PROPERTYME_CLIENT_SECRET`
  - `PROPERTYME_REDIRECT_URI`
  - `PROPERTYME_SCOPES`
  - token storage settings (see below)

### 6.2 Azure Functions security (Entra ID)

Copilot must assume **Functions endpoints are protected**.

- Prefer Entra ID (Easy Auth / App Service Authentication) so Functions receive an authenticated user context.
- The SPFx client should call Functions using an auth-aware client (e.g. MSAL or SPFx AAD utilities) and must not embed secrets.

### 6.3 OAuth client (Azure Functions)

Generate a `PropertyMeOAuthClient` module that:

- `buildAuthorizeUrl(state: string): string`
  - properly URL-encodes parameters:
    - `response_type=code`
    - `client_id`
    - `redirect_uri`
    - `scope` (space-separated)
    - `state`

- `exchangeCodeForTokens(code: string): Promise<TokenSet>`
  - POST `application/x-www-form-urlencoded` to token endpoint:
    - `grant_type=authorization_code`
    - `code`
    - `redirect_uri`
    - include client credentials as required by PropertyMe

- `refreshAccessToken(refreshToken: string): Promise<TokenSet>`
  - POST:
    - `grant_type=refresh_token`
    - `refresh_token`

### 6.4 State/CSRF protection

Copilot must implement state validation:

- Generate a random `state` per auth attempt.
- Store and validate it on callback.
- For local dev, an in-memory store is acceptable.
- For production, store state short-term in a durable store (e.g. Azure Table/Blob/Redis) with TTL.

### 6.5 Token models

Create strongly typed models:

```ts
export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  expiresAt: Date;
}
```

- `expiresAt` must be calculated at receipt time.

### 6.6 Token storage (Azure Functions)

Copilot must implement a `TokenStore` abstraction and provide at least one production-ready implementation.

- Interface:
  - `load(userKey: string): Promise<TokenSet | null>`
  - `save(userKey: string, tokens: TokenSet): Promise<void>`
  - `clear(userKey: string): Promise<void>`

- Recommended production storage pattern:
  - **Tokens stored encrypted at rest** in a tenant-controlled store.
  - Options (choose one in code; keep interface stable):
    - Azure Table Storage / Cosmos DB
    - Azure SQL
    - Redis

- Secrets (client secret, encryption keys) must be stored in:
  - Azure App Settings / Key Vault references (preferred)

### 6.7 PropertyMe HTTP client (server-side)

- Implement `PropertyMeHttpClient` that:
  - injects `Authorization: Bearer <access_token>`
  - refreshes token automatically on expiry or HTTP 401
  - enforces timeouts and retry limits
  - raises typed errors

### 6.8 Functions endpoints and contracts

Copilot should implement these HTTP-trigger functions:

- `GET /api/propertyme/authorize`
  - creates `state`
  - redirects to PropertyMe authorise endpoint

- `GET /api/propertyme/callback`
  - validates `state`
  - exchanges `code` for tokens
  - saves tokens in `TokenStore` keyed by authenticated user
  - redirects back to the SPFx page (or a success page)

- `GET /api/propertyme/<resource>`
  - loads tokens for user
  - refreshes if needed
  - calls PropertyMe API
  - returns JSON to client

### 6.9 Error handling

- Use typed errors:
  - `AuthError`, `ApiError`, `RateLimitError`
- Sanitize logs and responses.

---

## 7) Client-side (SPFx/React) usage pattern

Copilot should generate client code that:

- Calls **only internal** endpoints (never PropertyMe directly)
- Works in:
  - mock mode (no backend)
  - local dev mode (Vite + Azure Functions Core Tools)
  - cloud mode (SharePoint + Azure Functions)

### 7.1 Connect / Authorise button

```tsx
const handleConnect = () => {
  window.location.href = "/api/propertyme/authorize";
};
```

### 7.2 Data access example

```ts
export async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch("/api/propertyme/contacts");
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
}
```

### 7.3 Mock mode toggle

Copilot should implement a single feature flag to toggle mock vs live:

- `VITE_USE_MOCKS=true|false`

If `VITE_USE_MOCKS=true`, client fetch functions should return data from `src/mocks/...` (or a small mock service) instead of calling `/api/...`.

### 7.4 Local dev proxy wiring (Vite — local dev only)

This proxy configuration is **for local development and testing only**.
It exists solely to simulate the SharePoint → Azure Functions call pattern before the DDRE tenant is available.

Copilot should generate a Vite dev server proxy so the client always calls `/api/...`:

- Vite dev server: `http://localhost:3027`
- Azure Functions (Core Tools): `http://localhost:7071`
- Proxy rule: `/api` → `http://localhost:7071/api`

Example (TypeScript):

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3027,
    proxy: {
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

Important notes for Copilot:
- This proxy **must not** be relied on in production.
- SPFx builds deployed to SharePoint will call the **real Azure Functions endpoint**, not Vite.
- Client code must never hardcode backend hostnames or ports — always use relative `/api/...` paths.

