/**
 * DDRE Intranet API Clients
 *
 * Type-safe clients for Azure proxy services.
 * All API calls go through secure proxies - no secrets in SPFx.
 */

export { ApiError } from "./core/ApiError";
export { BaseClient } from "./core/BaseClient";
export type { ApiClientConfig } from "./core/types";

export { createAiClient } from "./clients/AiClient";
export type {
  QueryRequest,
  QueryResponse,
  Citation,
  FeedbackRequest,
} from "./clients/AiClient";

export { createVaultClient } from "./clients/VaultClient";
export type {
  Contact,
  ContactCreateRequest,
  ContactUpdateRequest,
  Deal,
  PaginatedResponse,
} from "./clients/VaultClient";

export { createPropertyMeClient } from "./clients/PropertyMeClient";
export type {
  Property,
  Tenant,
  Owner,
  MaintenanceRequest,
  DashboardSummary,
} from "./clients/PropertyMeClient";
