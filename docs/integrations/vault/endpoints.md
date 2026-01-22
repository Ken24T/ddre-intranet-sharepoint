# Vault API – Endpoint Reference

## Health Check

### `GET /api/v1/vault/health`

Check if the Vault API proxy is healthy.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T10:30:00Z"
}
```

---

## Contacts

### `GET /api/v1/vault/contacts`

List contacts with optional search and pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page (max 100) |
| `search` | string | - | Search by name or email |

**Response:**
```json
{
  "data": [
    {
      "id": "contact-123",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@example.com",
      "phone": "0412 345 678",
      "company": "Acme Corp",
      "createdAt": "2025-06-15T09:00:00Z",
      "updatedAt": "2026-01-10T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 156,
    "totalPages": 8
  }
}
```

### `GET /api/v1/vault/contacts/{id}`

Get a single contact by ID.

### `POST /api/v1/vault/contacts`

Create a new contact.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "phone": "0423 456 789",
  "company": "Example Ltd"
}
```

**Required Fields:** `firstName`, `lastName`

### `PUT /api/v1/vault/contacts/{id}`

Update an existing contact. Only include fields to update.

### `DELETE /api/v1/vault/contacts/{id}`

Delete a contact. Returns 204 No Content on success.

---

## Deals

### `GET /api/v1/vault/deals`

List deals/opportunities with pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page |

**Response:**
```json
{
  "data": [
    {
      "id": "deal-456",
      "title": "Property Sale - 123 Main St",
      "value": 750000.00,
      "stage": "negotiation",
      "contactId": "contact-123",
      "createdAt": "2026-01-05T11:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 42,
    "totalPages": 3
  }
}
```

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Validation error – check request body |
| 401 | Unauthorized – token invalid or expired |
| 403 | Forbidden – user lacks permission |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

See [error-handling.md](./error-handling.md) for details.
