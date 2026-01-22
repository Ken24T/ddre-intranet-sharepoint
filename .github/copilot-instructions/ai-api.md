# AI RAG API – Copilot Instructions

> Include this file when working on AI Assistant / chatbot features.

## Overview

The AI RAG API powers the Dante Library chatbot using OpenAI with retrieval-augmented generation.

**Consumer:** AI Assistant (floating chatbot button)
**Client:** `AiClient` from `@ddre/pkg-api-client`

## Key Files

| File | Purpose |
|------|---------|
| `contracts/ai/openapi.yml` | OpenAPI specification |
| `packages/pkg-api-client/src/clients/AiClient.ts` | TypeScript client |
| `docs/integrations/ai/` | Integration documentation |

## Entities

- **QueryRequest** – User question with optional conversation ID
- **QueryResponse** – Answer, citations, confidence score
- **Citation** – Source document (title, URL, snippet)
- **FeedbackRequest** – Rating (helpful/not helpful) + optional comment

## Usage Pattern

```typescript
import { AiClient } from '@ddre/pkg-api-client';

const aiClient = new AiClient({ baseUrl: environment.apiBaseUrl });

// Ask a question
const response = await aiClient.query({
  question: 'How do I submit a leave request?',
  maxCitations: 5
});

// Follow-up question (uses conversation context)
const followUp = await aiClient.query({
  question: 'What about sick leave?',
  conversationId: response.conversationId
});

// Submit feedback
await aiClient.submitFeedback({
  conversationId: response.conversationId,
  rating: 'helpful'
});
```

## Error Handling

| Error | User Message |
|-------|--------------|
| 429 Rate Limited | "Please wait a moment before asking another question." |
| 503 Unavailable | "The AI Assistant is temporarily unavailable." |
| Low confidence | "I'm not entirely sure, but..." |

## Confidence Score Handling

```typescript
function formatAnswer(response: QueryResponse): string {
  if (response.confidence < 0.5) {
    return `I'm not confident about this, but: ${response.answer}\n\nYou might want to contact support for a definitive answer.`;
  } else if (response.confidence < 0.8) {
    return `I think: ${response.answer}`;
  }
  return response.answer;
}
```

## Permissions

All authenticated users have access to the AI Assistant.

## Audit Logging

Log these events:
- `ai_query_submitted` – When user asks a question
- `ai_response_received` – When answer is displayed (include confidence)
- `ai_feedback_submitted` – When user rates an answer
- `ai_citation_clicked` – When user clicks a source link

## UI Patterns

- Floating action button (bottom-right corner)
- Chat panel slides up from button
- Pop-out to new window option
- Show citations as clickable links below answer
- Typing indicator while waiting for response
- "Was this helpful?" thumbs up/down after each answer

## Conversation State

- Store `conversationId` in component state
- Reset on "New conversation" button
- Conversation expires after 30 minutes of inactivity
- Show previous messages in chat history

## Pop-out Window

When popping out to new window:
- Pass conversation history via `window.postMessage`
- Maintain conversation ID for continuity
- Style popup window consistently with main app
