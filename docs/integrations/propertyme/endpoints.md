# PropertyMe API – Endpoint Reference

## Health Check

### `GET /api/v1/propertyme/health`

Check if the PropertyMe API proxy is healthy.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T10:30:00Z"
}
```

---

## Properties

### `GET /api/v1/propertyme/properties`

List properties with optional filtering and pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page (max 100) |
| `status` | string | active | Filter: active, inactive, all |
| `search` | string | - | Search by address or name |

**Response:**
```json
{
  "data": [
    {
      "id": "prop-123",
      "address": {
        "street": "42 Harbour View Rd",
        "suburb": "Pyrmont",
        "state": "NSW",
        "postcode": "2009",
        "country": "Australia"
      },
      "propertyType": "residential",
      "bedrooms": 3,
      "bathrooms": 2,
      "status": "active",
      "ownerId": "owner-456",
      "currentTenantId": "tenant-789",
      "rentAmount": 850.00,
      "rentFrequency": "weekly"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 234,
    "totalPages": 12
  }
}
```

### `GET /api/v1/propertyme/properties/{id}`

Get a single property by ID.

---

## Tenants

### `GET /api/v1/propertyme/tenants`

List tenants with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `pageSize` | integer | Items per page |
| `propertyId` | string | Filter by property |

**Response:**
```json
{
  "data": [
    {
      "id": "tenant-789",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "sarah.j@email.com",
      "phone": "0411 222 333",
      "leaseStart": "2025-06-01",
      "leaseEnd": "2026-05-31",
      "propertyId": "prop-123"
    }
  ],
  "meta": { ... }
}
```

### `GET /api/v1/propertyme/tenants/{id}`

Get a single tenant by ID.

---

## Owners

### `GET /api/v1/propertyme/owners`

List property owners.

**Response:**
```json
{
  "data": [
    {
      "id": "owner-456",
      "firstName": "Michael",
      "lastName": "Chen",
      "email": "m.chen@email.com",
      "phone": "0422 333 444",
      "propertyCount": 3
    }
  ],
  "meta": { ... }
}
```

### `GET /api/v1/propertyme/owners/{id}`

Get a single owner by ID.

---

## Maintenance

### `GET /api/v1/propertyme/maintenance`

List maintenance requests.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `pageSize` | integer | Items per page |
| `propertyId` | string | Filter by property |
| `status` | string | Filter: open, in_progress, completed, cancelled |

**Response:**
```json
{
  "data": [
    {
      "id": "maint-001",
      "propertyId": "prop-123",
      "description": "Leaking tap in bathroom",
      "status": "in_progress",
      "priority": "medium",
      "createdAt": "2026-01-15T09:00:00Z",
      "completedAt": null
    }
  ],
  "meta": { ... }
}
```

---

## Dashboard

### `GET /api/v1/propertyme/dashboard/summary`

Get aggregated metrics for the PM Dashboard.

**Response:**
```json
{
  "totalProperties": 234,
  "activeProperties": 218,
  "totalTenants": 312,
  "occupancyRate": 93.2,
  "openMaintenanceRequests": 15,
  "rentCollectedThisMonth": 425680.00,
  "rentOutstandingThisMonth": 12450.00
}
```

---

## Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized – token invalid or expired |
| 403 | Forbidden – user lacks permission |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

See [error-handling.md](./error-handling.md) for details.
