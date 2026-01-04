# How to Deploy (SPFx)

This intranet is deployed as a SharePoint Framework (SPFx) solution package (`.sppkg`) to SharePoint Online.

## Prerequisites

- SharePoint Online tenant with:
  - App Catalog configured (tenant app catalog preferred)
  - A target site collection (Home site / Communication site) for hosting pages
- Permissions:
  - SharePoint Admin (or App Catalog admin) to upload/deploy the `.sppkg`
  - Site Owner on the target site to add the app/web part to pages
- Local dev toolchain:
  - Node version from `spfx/ddre-intranet/.nvmrc` (currently Node 22.14.x)
  - npm

## Build the package

From the SPFx solution folder:

- `cd spfx/ddre-intranet`
- `npm ci`
- `npm run build`

Output:

- The packaged solution is written to `spfx/ddre-intranet/solution/ddre-intranet.sppkg`.

## Deploy to SharePoint App Catalog

1. Go to the SharePoint Admin Center.
2. Open **More features** → **Apps** → **App Catalog** (or your tenant app catalog site).
3. Upload `ddre-intranet.sppkg`.
4. When prompted:
   - Choose whether to **Make this solution available to all sites** (depends on governance).
   - Confirm deployment.

Notes:

- `skipFeatureDeployment` is enabled in `config/package-solution.json`, which supports tenant-wide deployment (still requires governance approval).
- `includeClientSideAssets` is enabled, so assets are packaged with the solution rather than requiring a separate CDN.

## Add the web part to a site/page

1. In the target site, go to **Site contents** → **New** → **App**.
2. Add the **DDRE Intranet** app.
3. Edit (or create) a modern page.
4. Add the relevant web part(s) to the page and configure properties.

## Environment configuration

- Authentication is Microsoft Entra ID SSO; there are no deployment-time secrets for the SPFx package.
- Any external integrations (Vault API, AI/RAG) must be served via Azure proxy services; the SPFx web parts should only call those proxies.

## Troubleshooting

- **Workbench URL doesn’t load**: `config/serve.json` uses `https://{tenantDomain}/_layouts/workbench.aspx`; replace `{tenantDomain}` with your tenant domain during local dev, or use a tenant-based workbench.
- **Web part not available**: confirm the `.sppkg` is deployed, the app is added to the site, and the user has permissions.
- **Build fails on Node version**: ensure you are using the Node version pinned by `.nvmrc`.
