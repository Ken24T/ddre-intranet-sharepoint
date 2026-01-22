# AI RAG API Contracts

This folder contains contracts for the **AI RAG (OpenAI) API** integration.

## Overview

The AI RAG API powers the Dante Library chatbot, providing AI-assisted answers with source citations from the knowledge base.

**Access Level:** Query + Feedback (no write to knowledge base)
**Consumer:** AI Assistant (floating chatbot)
**Authentication:** SharePoint token → Azure proxy → OpenAI API

## Files

| File | Description |
|------|-------------|
| `openapi.yml` | OpenAPI 3.0 specification for the proxy API |

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/ai/health` | GET | Health check |
| `/api/v1/ai/query` | POST | Ask a question, get answer with citations |
| `/api/v1/ai/feedback` | POST | Submit feedback on an answer |

## Key Entities

- **QueryRequest** – User question with optional conversation ID
- **QueryResponse** – AI answer with citations and confidence score
- **Citation** – Source document with title, URL, and snippet
- **FeedbackRequest** – Helpful/not helpful rating with optional comment

## See Also

- [AI integration docs](../../docs/integrations/ai/)
- [AiClient TypeScript](../../packages/pkg-api-client/src/clients/AiClient.ts)
