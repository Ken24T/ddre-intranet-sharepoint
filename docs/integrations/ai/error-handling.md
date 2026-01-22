# AI RAG API – Error Handling

## Error Response Format

All errors return a consistent JSON structure:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "You have exceeded the query limit. Please wait before trying again.",
    "details": {
      "retryAfter": 30
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
| `RATE_LIMITED` | 429 | Too many requests | Wait `retryAfter` seconds |
| `QUESTION_TOO_LONG` | 400 | Question exceeds 2000 chars | Shorten question |
| `INVALID_CONVERSATION` | 400 | Conversation ID not found | Start new conversation |

### Server Errors (5xx)

| Code | HTTP Status | Description | Action |
|------|-------------|-------------|--------|
| `OPENAI_UNAVAILABLE` | 503 | OpenAI API is down | Retry with backoff |
| `KNOWLEDGE_BASE_ERROR` | 503 | Dante Library unavailable | Retry with backoff |
| `PROXY_ERROR` | 502 | Azure proxy failed | Check proxy logs |
| `INTERNAL_ERROR` | 500 | Unexpected error | Report to admin |

## Retry Strategy

The `AiClient` implements automatic retry for transient errors:

```typescript
// Retry configuration
const retryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatuses: [429, 502, 503, 504]
};
```

### Rate Limit Handling

When rate limited, the response includes `retryAfter`:

```typescript
try {
  const response = await aiClient.query({ question });
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    const waitTime = error.details?.retryAfter || 30;
    showToast(`Please wait ${waitTime} seconds before asking another question.`, 'warning');
  }
}
```

## Client-Side Handling

```typescript
import { AiClient, isRetryableError } from '@ddre/pkg-api-client';

try {
  const response = await aiClient.query({ question: userInput });
  displayAnswer(response);
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    showToast('You\'re asking too many questions. Please wait a moment.', 'warning');
  } else if (error.code === 'QUESTION_TOO_LONG') {
    showToast('Your question is too long. Please shorten it.', 'warning');
  } else if (isRetryableError(error)) {
    showToast('The AI service is temporarily unavailable. Please try again.', 'error');
  } else {
    showToast('Unable to get an answer. Please try again later.', 'error');
    logError(error);
  }
}
```

## Graceful Degradation

When the AI service is unavailable:

1. Show a friendly message explaining the service is down
2. Offer alternative help options (Help Centre, contact support)
3. Cache recent successful responses for common questions

```typescript
const [isAvailable, setIsAvailable] = useState(true);

useEffect(() => {
  aiClient.checkHealth()
    .then(() => setIsAvailable(true))
    .catch(() => setIsAvailable(false));
}, []);

if (!isAvailable) {
  return (
    <MessageBar messageBarType={MessageBarType.warning}>
      The AI Assistant is temporarily unavailable. 
      <Link href="/help">Visit the Help Centre</Link> for assistance.
    </MessageBar>
  );
}
```

## Logging

All queries and errors are logged to the audit system with:
- Question text (may be truncated for privacy)
- Response confidence score
- Error code and message
- User context
- Correlation ID for tracing

See the Audit Log Viewer in the Administration hub for analysis.
