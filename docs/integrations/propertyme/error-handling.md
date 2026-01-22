# PropertyMe API – Error Handling

## Error Response Format

All errors return a consistent JSON structure:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "User does not have access to PropertyMe data",
    "details": {
      "requiredGroup": "PM Team"
    }
  }
}
```

## Error Codes

### Client Errors (4xx)

| Code | HTTP Status | Description | Action |
|------|-------------|-------------|--------|
| `INVALID_TOKEN` | 401 | SharePoint token is invalid | Re-authenticate |
| `TOKEN_EXPIRED` | 401 | SharePoint token has expired | Refresh token |
| `FORBIDDEN` | 403 | User lacks permission | Check group membership |
| `NOT_FOUND` | 404 | Resource does not exist | Verify ID |
| `RATE_LIMITED` | 429 | Too many requests | Wait and retry |

### Server Errors (5xx)

| Code | HTTP Status | Description | Action |
|------|-------------|-------------|--------|
| `PROPERTYME_UNAVAILABLE` | 503 | PropertyMe API is down | Retry with backoff |
| `PROXY_ERROR` | 502 | Azure proxy failed | Check proxy logs |
| `INTERNAL_ERROR` | 500 | Unexpected error | Report to admin |

## Retry Strategy

The `PropertyMeClient` implements automatic retry for transient errors:

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
- 401 Unauthorized – re-authenticate
- 403 Forbidden – user lacks access
- 404 Not Found – resource doesn't exist

## Client-Side Handling

```typescript
import { PropertyMeClient, isRetryableError } from '@ddre/pkg-api-client';

try {
  const summary = await propertyMeClient.getDashboardSummary();
} catch (error) {
  if (error.code === 'FORBIDDEN') {
    showToast('You do not have access to PM data.', 'error');
  } else if (error.code === 'RATE_LIMITED') {
    showToast('Too many requests. Please wait.', 'warning');
  } else if (isRetryableError(error)) {
    showToast('Unable to load data. Please try again.', 'error');
  } else {
    showToast('An unexpected error occurred.', 'error');
    logError(error);
  }
}
```

## Dashboard Fallback

If the dashboard summary fails, show cached data or a friendly message:

```typescript
const [summary, setSummary] = useState<DashboardSummary | null>(null);
const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

useEffect(() => {
  propertyMeClient.getDashboardSummary()
    .then((data) => {
      setSummary(data);
      setLastUpdated(new Date());
      localStorage.setItem('pm-dashboard-cache', JSON.stringify(data));
    })
    .catch(() => {
      // Try to load cached data
      const cached = localStorage.getItem('pm-dashboard-cache');
      if (cached) {
        setSummary(JSON.parse(cached));
        showToast('Showing cached data. Live data unavailable.', 'warning');
      }
    });
}, []);
```

## Logging

All errors are logged to the audit system with:
- Error code and message
- Request details (endpoint, method)
- User context
- Correlation ID for tracing

See the Audit Log Viewer in the Administration hub for error analysis.
