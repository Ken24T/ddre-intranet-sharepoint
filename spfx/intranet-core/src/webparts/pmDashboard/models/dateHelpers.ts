/**
 * PM Dashboard – Date helper utilities.
 *
 * All dates are stored as DD/MM display format in the data model.
 * ISO format (YYYY-MM-DD) is used only for native date input and sorting.
 * Australian English conventions: DD/MM/YYYY.
 */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** ES5-safe zero-pad to two digits. */
function pad2(value: string | number): string {
  const s = String(value);
  return s.length < 2 ? "0" + s : s;
}

/**
 * Convert an ISO date string (YYYY-MM-DD) to DD/MM display format.
 * Returns empty string for falsy input.
 */
export function isoToDisplay(iso: string | undefined): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length < 3) return "";
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day)) return "";
  return `${pad2(day)}/${pad2(month)}`;
}

/**
 * Convert a DD/MM or DD/MM/YYYY display string to ISO (YYYY-MM-DD).
 * If no year is provided, the current year is used.
 * Returns today's ISO date for unparseable input.
 */
export function displayToIso(display: string | undefined): string {
  if (!display) return todayIso();
  const parts = display.split("/");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${pad2(m)}-${pad2(d)}`;
  }
  if (parts.length === 2) {
    const [d, m] = parts;
    const y = new Date().getFullYear();
    return `${y}-${pad2(m)}-${pad2(d)}`;
  }
  return todayIso();
}

/**
 * Return today's date in ISO format (YYYY-MM-DD).
 */
export function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = pad2(now.getMonth() + 1);
  const d = pad2(now.getDate());
  return `${y}-${m}-${d}`;
}

/**
 * Return today's date in DD/MM display format.
 */
export function todayDisplay(): string {
  return isoToDisplay(todayIso());
}

/**
 * Get the abbreviated day-of-week name for a DD/MM display date string.
 * Returns empty string if the date is unparseable.
 */
export function getDayOfWeek(displayDate: string): string {
  if (!displayDate) return "";
  const iso = displayToIso(displayDate);
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  return DAY_NAMES[date.getDay()];
}

/**
 * Compare two DD/MM display dates for sorting.
 * Returns negative if a < b, positive if a > b, 0 if equal.
 */
export function compareDates(a: string, b: string): number {
  const isoA = displayToIso(a);
  const isoB = displayToIso(b);
  return isoA.localeCompare(isoB);
}

/**
 * Convert a JavaScript Date object to DD/MM display format.
 */
export function dateToDisplay(date: Date): string {
  const d = pad2(date.getDate());
  const m = pad2(date.getMonth() + 1);
  return `${d}/${m}`;
}

/**
 * Convert a JavaScript Date object to ISO format (YYYY-MM-DD).
 */
export function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

/**
 * Parse a DD/MM or DD/MM/YYYY display string into a Date object.
 * Returns undefined if parsing fails.
 */
export function parseDisplayDate(display: string): Date | undefined {
  if (!display) return undefined;
  const iso = displayToIso(display);
  const date = new Date(iso);
  return isNaN(date.getTime()) ? undefined : date;
}
