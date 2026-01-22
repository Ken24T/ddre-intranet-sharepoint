# AI RAG API – Endpoint Reference

## Health Check

### `GET /api/v1/ai/health`

Check if the AI API proxy is healthy.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T10:30:00Z"
}
```

---

## Query

### `POST /api/v1/ai/query`

Ask a question against the Dante Library knowledge base.

**Request Body:**
```json
{
  "question": "What is the process for booking annual leave?",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "maxCitations": 5
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | ✅ | User's question (max 2000 chars) |
| `conversationId` | uuid | ❌ | For follow-up questions |
| `maxCitations` | integer | ❌ | Max citations to return (1-10, default 5) |

**Response:**
```json
{
  "answer": "To book annual leave, you need to submit a request through the HR portal at least 2 weeks in advance. Your manager will receive a notification and can approve or decline the request. Once approved, the leave will appear in your calendar.",
  "citations": [
    {
      "title": "Leave Policy Handbook",
      "url": "https://dougdisher.sharepoint.com/sites/hr/leave-policy.pdf",
      "snippet": "Annual leave requests must be submitted a minimum of 14 days prior to the intended leave date..."
    },
    {
      "title": "HR Portal User Guide",
      "url": "https://dougdisher.sharepoint.com/sites/hr/portal-guide.pdf",
      "snippet": "Navigate to My Leave > Request Leave to submit a new leave application..."
    }
  ],
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "confidence": 0.92
}
```

| Field | Type | Description |
|-------|------|-------------|
| `answer` | string | AI-generated answer |
| `citations` | array | Source documents with snippets |
| `conversationId` | uuid | Use for follow-up questions |
| `confidence` | float | Confidence score (0-1) |

---

## Feedback

### `POST /api/v1/ai/feedback`

Submit feedback on an AI response.

**Request Body:**
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "rating": "helpful",
  "comment": "This answered my question perfectly!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conversationId` | uuid | ✅ | From the query response |
| `rating` | enum | ✅ | `helpful` or `not_helpful` |
| `comment` | string | ❌ | Optional feedback text (max 500 chars) |

**Response:** `204 No Content`

---

## Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized – token invalid or expired |
| 429 | Rate limit exceeded – wait and retry |
| 500 | Internal server error |
| 503 | OpenAI service unavailable |

See [error-handling.md](./error-handling.md) for details.
