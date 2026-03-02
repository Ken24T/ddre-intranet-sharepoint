/**
 * diffChanges — Computes a human-readable list of field-level
 * changes between two plain objects.
 *
 * Used by AuditedBudgetRepository to enrich audit log summaries
 * with "what exactly changed" detail.
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** A single field-level change. */
export interface FieldChange {
  /** The property name that changed. */
  field: string;
  /** Previous value (serialised for display). */
  from: string;
  /** New value (serialised for display). */
  to: string;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Fields to skip when diffing — they always change and aren't meaningful. */
const IGNORED_FIELDS: ReadonlySet<string> = new Set([
  "updatedAt",
  "createdAt",
]);

/** Pretty-print a value for display in summaries. */
function displayValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value || '""';
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.length} items]`;
  return JSON.stringify(value);
}

/**
 * Compare two plain objects and return a list of field-level changes.
 *
 * Only examines own, enumerable, top-level properties by default.
 * Nested objects / arrays are compared via JSON serialisation so
 * that deep structure changes are detected.
 *
 * @param before  The previous version of the entity.
 * @param after   The updated version of the entity.
 * @param ignore  Extra field names to skip (merged with IGNORED_FIELDS).
 */
export function diffChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  ignore?: ReadonlySet<string>,
): FieldChange[] {
  const skip: ReadonlySet<string> = ignore
    ? ((): Set<string> => {
        const merged = new Set<string>();
        IGNORED_FIELDS.forEach((f) => merged.add(f));
        ignore.forEach((f) => merged.add(f));
        return merged;
      })()
    : IGNORED_FIELDS;

  const changes: FieldChange[] = [];
  const allKeys = new Set<string>();
  Object.keys(before).forEach((k) => allKeys.add(k));
  Object.keys(after).forEach((k) => allKeys.add(k));

  allKeys.forEach((key) => {
    if (skip.has(key)) return;

    const a = before[key];
    const b = after[key];

    // Fast path: identical primitives
    if (a === b) return;

    // Deep comparison for objects / arrays
    const aJson = JSON.stringify(a ?? null);
    const bJson = JSON.stringify(b ?? null);
    if (aJson === bJson) return;

    changes.push({
      field: key,
      from: displayValue(a),
      to: displayValue(b),
    });
  });

  return changes;
}

// ─────────────────────────────────────────────────────────────
// Summary formatters
// ─────────────────────────────────────────────────────────────

/**
 * Build a one-line summary from a list of field changes.
 * Example: `Changed name "Acme" → "Acme Corp", status "draft" → "approved"`
 */
export function summariseChanges(
  prefix: string,
  changes: FieldChange[],
  maxFields: number = 4,
): string {
  if (changes.length === 0) return `${prefix} (no field changes detected)`;

  const items = changes
    .slice(0, maxFields)
    .map((c) => `${formatFieldName(c.field)} ${c.from} → ${c.to}`);

  const remaining = changes.length - maxFields;
  if (remaining > 0) {
    items.push(`+${remaining} more`);
  }
  return `${prefix}: ${items.join(", ")}`;
}

/**
 * Convert camelCase / snake_case field names to a friendlier form.
 * e.g. "propertyAddress" → "property address", "vendorId" → "vendor"
 */
function formatFieldName(field: string): string {
  // Strip trailing "Id" — we describe the relationship, not the FK
  const cleaned = field.replace(/Id$/, "");
  // camelCase → spaced
  return cleaned.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}
