# AI RAG API Integration – Overview

## What is the AI RAG API?

The AI RAG (Retrieval-Augmented Generation) API powers the Dante Library chatbot. It uses OpenAI's language models combined with a knowledge base to provide accurate, cited answers to user questions.

**RAG Flow:**
1. User asks a question
2. System searches the Dante Library knowledge base for relevant documents
3. Relevant excerpts are sent to OpenAI as context
4. OpenAI generates an answer based on the context
5. Answer is returned with source citations

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SPFx Web Part                            │
│   (AI Assistant – floating chat button)                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │ SharePoint token + question
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Azure Proxy Function                        │
│   - Validates SharePoint token                                   │
│   - Queries Dante Library knowledge base                         │
│   - Retrieves OpenAI API key from Key Vault                      │
│   - Calls OpenAI with context (RAG)                              │
│   - Returns answer with citations                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │ OpenAI API key
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         OpenAI API                               │
│   (GPT-4 or similar model)                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Access Level

**Query + Feedback** – No direct write access to knowledge base

| Operation | Supported | Notes |
|-----------|-----------|-------|
| Query | ✅ | Ask questions, get answers |
| Feedback | ✅ | Rate answers as helpful/not helpful |
| Knowledge base update | ❌ | Managed separately |

## Authentication Flow

1. SPFx sends question with current user's SharePoint token
2. Azure proxy validates token and extracts user identity
3. Proxy queries the Dante Library for relevant documents
4. Proxy retrieves OpenAI API key from Azure Key Vault
5. Proxy calls OpenAI with question + retrieved context
6. Answer with citations is returned to SPFx

## Permissions

| SharePoint Group | AI Access |
|-----------------|-----------|
| All authenticated users | Query + Feedback |

## Rate Limits

- **Per user:** 20 queries/minute
- **Per organisation:** 500 queries/hour
- **Azure proxy:** Implements rate limiting and retry logic

## Conversation Context

The API supports multi-turn conversations:

```typescript
// First question
const response1 = await aiClient.query({ 
  question: 'What is the leave policy?' 
});

// Follow-up uses conversationId
const response2 = await aiClient.query({
  question: 'How do I apply?',
  conversationId: response1.conversationId
});
```

Conversation context is maintained for **30 minutes** of inactivity.

## Confidence Scores

Responses include a confidence score (0-1):

| Score | Meaning | UI Treatment |
|-------|---------|--------------|
| > 0.8 | High confidence | Show answer normally |
| 0.5-0.8 | Medium confidence | Add "I'm not entirely sure" prefix |
| < 0.5 | Low confidence | Suggest contacting support |

## Error Handling

See [error-handling.md](./error-handling.md) for error codes and retry strategies.

## See Also

- [OpenAPI Spec](../../../contracts/ai/openapi.yml)
- [Endpoint Reference](./endpoints.md)
- [AiClient](../../../packages/pkg-api-client/src/clients/AiClient.ts)
