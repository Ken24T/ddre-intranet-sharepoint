/**
 * IBudgetTemplateService — Interface for budget template CRUD operations.
 *
 * Templates are user-saved snapshots of budget line item configurations
 * that can be quickly reapplied when creating new budgets.
 */

import type { BudgetTemplate } from "../models/types";

export interface IBudgetTemplateService {
  /** Get all saved templates, sorted by most-recently-created first. */
  getTemplates(): Promise<BudgetTemplate[]>;

  /** Get a single template by ID. */
  getTemplate(id: number): Promise<BudgetTemplate | undefined>;

  /** Create or update a template. */
  saveTemplate(template: BudgetTemplate): Promise<BudgetTemplate>;

  /** Delete a template by ID. */
  deleteTemplate(id: number): Promise<void>;
}
