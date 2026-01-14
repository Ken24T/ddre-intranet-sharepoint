import type { WebPartContext } from "@microsoft/sp-webpart-base";
import { BaseClient } from "../core/BaseClient";
import type { ApiClientConfig, PaginationMeta, PaginationParams } from "../core/types";

// =============================================================================
// TYPES
// =============================================================================

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactCreateRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface ContactUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  contactId: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListContactsParams extends PaginationParams {
  search?: string;
}

// =============================================================================
// CLIENT
// =============================================================================

/**
 * Client for the Vault (Sales CRM) proxy.
 */
class VaultClient extends BaseClient {
  protected getHealthPath(): string {
    return "/api/v1/vault/health";
  }

  // ---------------------------------------------------------------------------
  // CONTACTS
  // ---------------------------------------------------------------------------

  /**
   * List contacts with pagination.
   */
  public async listContacts(
    params?: ListContactsParams
  ): Promise<PaginatedResponse<Contact>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.pageSize) queryParams.pageSize = String(params.pageSize);
    if (params?.search) queryParams.search = params.search;

    return this.get<PaginatedResponse<Contact>>(
      "/api/v1/vault/contacts",
      queryParams
    );
  }

  /**
   * Get a contact by ID.
   */
  public async getContact(id: string): Promise<Contact> {
    return this.get<Contact>(`/api/v1/vault/contacts/${id}`);
  }

  /**
   * Create a new contact.
   */
  public async createContact(data: ContactCreateRequest): Promise<Contact> {
    return this.post<Contact>("/api/v1/vault/contacts", data);
  }

  /**
   * Update a contact.
   */
  public async updateContact(
    id: string,
    data: ContactUpdateRequest
  ): Promise<Contact> {
    return this.put<Contact>(`/api/v1/vault/contacts/${id}`, data);
  }

  /**
   * Delete a contact.
   */
  public async deleteContact(id: string): Promise<void> {
    await this.delete(`/api/v1/vault/contacts/${id}`);
  }

  // ---------------------------------------------------------------------------
  // DEALS
  // ---------------------------------------------------------------------------

  /**
   * List deals with pagination.
   */
  public async listDeals(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Deal>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.pageSize) queryParams.pageSize = String(params.pageSize);

    return this.get<PaginatedResponse<Deal>>("/api/v1/vault/deals", queryParams);
  }
}

/**
 * Create a Vault client instance.
 */
export function createVaultClient(
  context: WebPartContext,
  baseUrl?: string
): VaultClient {
  return new VaultClient({ context, baseUrl });
}
