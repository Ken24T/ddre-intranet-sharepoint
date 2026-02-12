import { HttpClient, HttpClientResponse, type IHttpClientOptions } from "@microsoft/sp-http";
import type { WebPartContext } from "@microsoft/sp-webpart-base";
import { ApiError } from "./ApiError";
import type { ApiClientConfig, HealthResponse } from "./types";

/**
 * Base client for all API proxies.
 * Handles token acquisition, request/response handling, and error mapping.
 */
export abstract class BaseClient {
  protected readonly context: WebPartContext;
  protected readonly baseUrl: string;

  constructor(config: ApiClientConfig) {
    this.context = config.context;
    this.baseUrl = config.baseUrl ?? this.detectBaseUrl();
  }

  /**
   * Detect API base URL from current environment.
   * Override in subclasses if needed.
   */
  protected detectBaseUrl(): string {
    const siteUrl = this.context.pageContext.web.absoluteUrl.toLowerCase();

    if (siteUrl.includes("/sites/dev-intranet")) {
      return "https://api-dev.disher.com.au";
    } else if (siteUrl.includes("/sites/test-intranet")) {
      return "https://api-test.disher.com.au";
    } else {
      return "https://api.disher.com.au";
    }
  }

  /**
   * Make a GET request.
   */
  protected async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params);
    const response = await this.context.httpClient.get(
      url,
      HttpClient.configurations.v1,
      this.getRequestOptions()
    );
    return this.handleResponse<T>(response);
  }

  /**
   * Make a POST request.
   */
  protected async post<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    const response = await this.context.httpClient.post(
      url,
      HttpClient.configurations.v1,
      {
        ...this.getRequestOptions(),
        body: body ? JSON.stringify(body) : undefined,
      }
    );
    return this.handleResponse<T>(response);
  }

  /**
   * Make a PUT request.
   */
  protected async put<T>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    const response = await this.context.httpClient.fetch(
      url,
      HttpClient.configurations.v1,
      {
        method: "PUT",
        ...this.getRequestOptions(),
        body: JSON.stringify(body),
      }
    );
    return this.handleResponse<T>(response);
  }

  /**
   * Make a DELETE request.
   */
  protected async delete(path: string): Promise<void> {
    const url = this.buildUrl(path);
    const response = await this.context.httpClient.fetch(
      url,
      HttpClient.configurations.v1,
      {
        method: "DELETE",
        ...this.getRequestOptions(),
      }
    );

    if (!response.ok) {
      await this.throwApiError(response);
    }
  }

  /**
   * Health check endpoint.
   */
  public async health(): Promise<HealthResponse> {
    return this.get<HealthResponse>(this.getHealthPath());
  }

  /**
   * Get the health check path. Override in subclasses.
   */
  protected abstract getHealthPath(): string;

  /**
   * Build full URL with query parameters.
   */
  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    return url.toString();
  }

  /**
   * Get default request options.
   */
  private getRequestOptions(): IHttpClientOptions {
    return {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
  }

  /**
   * Handle API response.
   */
  private async handleResponse<T>(response: HttpClientResponse): Promise<T> {
    if (!response.ok) {
      await this.throwApiError(response);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Parse error response and throw ApiError.
   */
  private async throwApiError(response: HttpClientResponse): Promise<never> {
    let code = "UNKNOWN_ERROR";
    let message = `Request failed with status ${response.status}`;
    let details: Record<string, unknown> | undefined;

    try {
      const errorBody = await response.json();
      if (errorBody.error) {
        code = errorBody.error.code ?? code;
        message = errorBody.error.message ?? message;
        details = errorBody.error.details;
      }
    } catch {
      // Response body is not JSON, use defaults
    }

    throw new ApiError(response.status, code, message, details);
  }
}
