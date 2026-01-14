import type { WebPartContext } from "@microsoft/sp-webpart-base";

/**
 * Configuration for API clients.
 */
export interface ApiClientConfig {
  /**
   * SPFx web part context for token acquisition.
   */
  context: WebPartContext;

  /**
   * Base URL for the API proxy.
   * If not provided, will be determined from environment.
   */
  baseUrl?: string;
}

/**
 * Standard pagination parameters.
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Standard pagination metadata.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Health check response.
 */
export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
}
