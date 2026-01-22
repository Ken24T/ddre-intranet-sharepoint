# Vault API – Copilot Instructions

> Include this file when working on Vault CRM integration features.
> For detailed API reference, see [vault-api-detailed.md](vault-api-detailed.md).

## Overview

Vault is the Sales CRM (VaultRE). Access is **full CRUD** via Azure proxy.

- **Consumer:** Sales hub cards and applications
- **Client:** `VaultClient` from `@ddre/pkg-api-client`
- **Upstream:** VaultRE API v1.3
- **Swagger:** <https://docs.api.vaultre.com.au/swagger/index.html>

## Key Files

| File                               | Purpose                    |
|------------------------------------|----------------------------|
| `contracts/vault/openapi.yml`      | DDRE proxy OpenAPI spec    |
| `contracts/vault/vaultre-upstream.yaml` | VaultRE upstream spec |
| `contracts/vault/schemas/contact.json` | Contact entity schema  |
| `packages/pkg-api-client/.../VaultClient.ts` | TypeScript client |
| `docs/integrations/vault/`         | Integration docs           |

## Entities

- **Contact** – Person or organisation (see `contracts/vault/schemas/contact.json`)
- **Property** – Sales/lease listing with lifecycle
- **Deal** – Sales opportunity (`title`, `value`, `stage`, `contactId`)

## Usage Pattern

```typescript
import { VaultClient } from '@ddre/pkg-api-client';

const vaultClient = new VaultClient({ baseUrl: environment.apiBaseUrl });

// List contacts with search
const contacts = await vaultClient.listContacts({ 
  search: 'Smith',
  page: 1,
  pageSize: 20 
});

// Create a contact
const newContact = await vaultClient.createContact({
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com'
});

// Update a contact
await vaultClient.updateContact('contact-123', { phone: '0412 345 678' });

// Delete a contact
await vaultClient.deleteContact('contact-123');
```

## Error Handling

Always handle these errors gracefully:

| Error           | User Message                         |
|-----------------|--------------------------------------|
| 403 Forbidden   | "You don't have access to sales data." |
| 404 Not Found   | "Contact not found."                 |
| 429 Rate Limited | "Too many requests. Please wait."   |

```typescript
try {
  await vaultClient.getContact(id);
} catch (error) {
  if (error.status === 403) {
    showToast('You don\'t have access to this contact.', 'error');
  } else if (error.status === 404) {
    showToast('Contact not found.', 'warning');
  } else {
    showToast('Unable to load contact.', 'error');
  }
}
```

## Permissions

Only users in **Sales Team** or **Sales Managers** SharePoint groups have access.

## Audit Logging

Log these events:
- `vault_contact_viewed` – When viewing a contact
- `vault_contact_created` – When creating a contact
- `vault_contact_updated` – When updating a contact
- `vault_contact_deleted` – When deleting a contact
- `vault_search_executed` – When searching contacts

## UI Patterns

- Use Fluent UI `DetailsList` for contact tables
- Show loading shimmer while fetching
- Handle empty states with "No contacts found" message
- Use `PersonaPresence` for contact cards
