# @ddre/pkg-api-client

Type-safe API clients for DDRE Intranet Azure proxy services.

## Purpose

Provides strongly-typed API client wrappers for calling Azure proxy services from SPFx web parts. Handles:

- Token acquisition from SPFx context
- Environment-aware base URLs
- Type-safe request/response handling
- Consistent error handling

## Installation

```bash
npm install @ddre/pkg-api-client
```

## Usage

```typescript
import { createAiClient, createVaultClient, createPropertyMeClient } from '@ddre/pkg-api-client';

// In your SPFx web part
export default class MyWebPart extends BaseClientSideWebPart<IMyWebPartProps> {
  
  private async queryAi(): Promise<void> {
    const client = createAiClient(this.context);
    
    const response = await client.query({
      question: "What is our leave policy?",
      maxCitations: 5
    });
    
    console.log(response.answer);
    console.log(response.citations);
  }
}
```

## Available Clients

### AI RAG Client (`createAiClient`)
- `query(request)` — Ask a question
- `submitFeedback(request)` — Submit feedback on an answer

### Vault Client (`createVaultClient`)
- `listContacts(params)` — List contacts with pagination
- `getContact(id)` — Get a contact
- `createContact(data)` — Create a contact
- `updateContact(id, data)` — Update a contact
- `deleteContact(id)` — Delete a contact
- `listDeals(params)` — List deals

### PropertyMe Client (`createPropertyMeClient`)
- `listProperties(params)` — List properties
- `getProperty(id)` — Get a property
- `listTenants(params)` — List tenants
- `getTenant(id)` — Get a tenant
- `listOwners(params)` — List owners
- `getOwner(id)` — Get an owner
- `listMaintenance(params)` — List maintenance requests
- `getDashboardSummary()` — Get dashboard metrics

## Error Handling

```typescript
import { ApiError } from '@ddre/pkg-api-client';

try {
  const response = await client.query({ question: "..." });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error: ${error.code} - ${error.message}`);
    if (error.status === 429) {
      // Rate limited - show message to user
    }
  }
}
```

## Note

This package depends on SPFx context for token acquisition. It cannot be used outside of SPFx web parts.
