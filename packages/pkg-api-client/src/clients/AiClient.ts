import type { WebPartContext } from "@microsoft/sp-webpart-base";
import { BaseClient } from "../core/BaseClient";
import type { ApiClientConfig } from "../core/types";

// =============================================================================
// TYPES
// =============================================================================

export interface QueryRequest {
  question: string;
  conversationId?: string;
  maxCitations?: number;
}

export interface QueryResponse {
  answer: string;
  citations: Citation[];
  conversationId?: string;
  confidence?: number;
}

export interface Citation {
  title: string;
  url: string;
  snippet?: string;
}

export interface FeedbackRequest {
  conversationId: string;
  rating: "helpful" | "not_helpful";
  comment?: string;
}

// =============================================================================
// CLIENT
// =============================================================================

/**
 * Client for the AI RAG proxy (Dante Library chatbot).
 */
class AiClient extends BaseClient {
  protected getHealthPath(): string {
    return "/api/v1/ai/health";
  }

  /**
   * Ask a question against the Dante Library knowledge base.
   */
  public async query(request: QueryRequest): Promise<QueryResponse> {
    return this.post<QueryResponse>("/api/v1/ai/query", request);
  }

  /**
   * Submit feedback on an AI response.
   */
  public async submitFeedback(request: FeedbackRequest): Promise<void> {
    await this.post<void>("/api/v1/ai/feedback", request);
  }
}

/**
 * Create an AI client instance.
 */
export function createAiClient(
  context: WebPartContext,
  baseUrl?: string
): AiClient {
  return new AiClient({ context, baseUrl });
}
