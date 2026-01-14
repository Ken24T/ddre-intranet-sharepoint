# Environment Configuration

This folder contains environment-specific configuration for Dev, Test, and Production.

## Files

| File | Purpose |
|------|---------|
| `dev.json` | Development tenant settings |
| `test.json` | Test/UAT tenant settings |
| `prod.json` | Production tenant settings |
| `environment.schema.json` | JSON Schema for validation |

## Usage

### Local Development (serve.json)

Update `config/serve.json` with your target environment's workbench URL:

```json
{
  "initialPage": "https://ddredev.sharepoint.com/_layouts/workbench.aspx"
}
```

### E2E Tests

Set the `PLAYWRIGHT_BASE_URL` environment variable:

```powershell
$env:PLAYWRIGHT_BASE_URL = "https://ddredev.sharepoint.com/sites/intranet"
npm run test:e2e
```

### Runtime Environment Detection

SPFx web parts can detect their environment at runtime via `this.context.pageContext.web.absoluteUrl` and match against known patterns.

## Updating Tenant URLs

When your actual tenant is provisioned, update the placeholder values in each JSON file. The domain naming pattern will depend on your Microsoft 365 tenant configuration.

**Example patterns:**
- Single tenant: `dougdisher.sharepoint.com` (prod), with dev/test as separate site collections
- Multi-tenant: `ddredev.sharepoint.com`, `ddretest.sharepoint.com`, `dougdisher.sharepoint.com`
