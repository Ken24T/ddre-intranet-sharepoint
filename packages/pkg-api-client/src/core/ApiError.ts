/**
 * Custom error class for API errors.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if this is a rate limit error.
   */
  public isRateLimited(): boolean {
    return this.status === 429;
  }

  /**
   * Check if this is an authentication error.
   */
  public isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Check if this is a permission error.
   */
  public isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Check if this is a not found error.
   */
  public isNotFound(): boolean {
    return this.status === 404;
  }
}
