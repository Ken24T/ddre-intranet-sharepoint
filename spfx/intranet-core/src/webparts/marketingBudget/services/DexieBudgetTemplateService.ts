/**
 * DexieBudgetTemplateService — IndexedDB-backed template storage.
 *
 * Reads and writes to the `budgetTemplates` table in the
 * `salesmarketing-spfx` Dexie database (version 3+).
 */

import type { BudgetTemplate } from "../models/types";
import type { IBudgetTemplateService } from "./IBudgetTemplateService";
import { db } from "./db";

export class DexieBudgetTemplateService implements IBudgetTemplateService {
  public async getTemplates(): Promise<BudgetTemplate[]> {
    return db.budgetTemplates.orderBy("createdAt").reverse().toArray();
  }

  public async getTemplate(id: number): Promise<BudgetTemplate | undefined> {
    return db.budgetTemplates.get(id);
  }

  public async saveTemplate(
    template: BudgetTemplate,
  ): Promise<BudgetTemplate> {
    const now = new Date().toISOString();
    const record: BudgetTemplate = {
      ...template,
      updatedAt: now,
      createdAt: template.createdAt || now,
    };

    const id = await db.budgetTemplates.put(record);
    return { ...record, id };
  }

  public async deleteTemplate(id: number): Promise<void> {
    await db.budgetTemplates.delete(id);
  }
}
