# Vault API – Error Handling

## Error Response Format

All errors return a consistent JSON structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email format is invalid",
    "details": {
      "field": "email",
      "value": "not-an-email"
    }
  }
}
```

## Error Codes

### Client Errors (4xx)

| Code | HTTP Status | Description | Action |
|------|-------------|-------------|--------|
| `VALIDATION_ERROR` | 400 | Request body validation failed | Check field values |
| `INVALID_TOKEN` | 401 | SharePoint token is invalid | Re-authenticate |
| `TOKEN_EXPIRED` | 401 | SharePoint token has expired | Refresh token |
| `FORBIDDEN` | 403 | User lacks permission | Check group membership |
| `NOT_FOUND` | 404 | Resource does not exist | Verify ID |
| `RATE_LIMITED` | 429 | Too many requests | Wait and retry |

### Server Errors (5xx)

| Code | HTTP Status | Description | Action |
|------|-------------|-------------|--------|
| `VAULT_UNAVAILABLE` | 503 | Vault API is down | Retry with backoff |
| `PROXY_ERROR` | 502 | Azure proxy failed | Check proxy logs |
| `INTERNAL_ERROR` | 500 | Unexpected error | Report to admin |

## Retry Strategy

The `VaultClient` implements automatic retry for transient errors:

```typescript
// Retry configuration
const retryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatuses: [429, 502, 503, 504]
};
```

### Exponential Backoff

| Attempt | Delay |
|---------|-------|
| 1 | 1 second |
| 2 | 2 seconds |
| 3 | 4 seconds |

### Non-Retryable Errors

Do **not** retry these errors:
- 400 Validation Error – fix the request
- 401 Unauthorized – re-authenticate
- 403 Forbidden – user lacks access
- 404 Not Found – resource doesn't exist

## Client-Side Handling

```typescript
import { VaultClient, isRetryableError } from '@ddre/pkg-api-client';

try {
  const contacts = await vaultClient.listContacts({ search: 'Smith' });
} catch (error) {
  if (error.code === 'FORBIDDEN') {
    showToast('You do not have access to contacts.', 'error');
  } else if (error.code === 'RATE_LIMITED') {
    showToast('Too many requests. Please wait and try again.', 'warning');
  } else if (isRetryableError(error)) {
    // Already retried – show generic error
    showToast('Unable to load contacts. Please try again later.', 'error');
  } else {
    showToast('An unexpected error occurred.', 'error');
    logError(error);
  }
}
```

## Logging

All errors are logged to the audit system with:
- Error code and message
- Request details (endpoint, method)
- User context
- Correlation ID for tracing

See the Audit Log Viewer in the Administration hub for error analysis.
