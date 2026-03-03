/**
 * useColumnResize – Interactive column resizing via adjacent-column
 * compensation.
 *
 * How it works:
 *  1. On pointer-down the caller passes a snapshot of every column's
 *     current *rendered* width (border-box, via `getComputedStyle`).
 *  2. The hook determines the **adjacent** column (right neighbour,
 *     or left if the dragged column is last).
 *  3. During drag the dragged column grows/shrinks by Δ pixels while
 *     the adjacent column absorbs the inverse (−Δ).  All other
 *     columns are locked to their snapshot widths.
 *  4. Because Δ − Δ = 0 the total column-width sum never changes,
 *     so `table-layout: fixed; width: 100%` is satisfied and no
 *     redistribution occurs.
 *  5. On pointer-up both changed widths are committed via `onChange`.
 */

import * as React from "react";
import type { SectionColumnWidths } from "../models/types";

/** Minimum column width in pixels (prevents collapse). */
const MIN_COL_WIDTH = 30;

export interface IUseColumnResizeOptions {
  /** Number of columns in the table. */
  columnCount: number;
  /** Current persisted widths (column index → px). May be sparse. */
  widths: SectionColumnWidths;
  /** Default widths applied when no stored width exists (sparse). */
  defaultWidths?: SectionColumnWidths;
  /** Called when the user finishes resizing (once per affected column). */
  onChange: (colIndex: number, width: number) => void;
}

export interface IUseColumnResizeResult {
  /** Returns inline style for a `<th>` at the given column index. */
  getHeaderStyle: (colIndex: number) => React.CSSProperties | undefined;

  /**
   * Pointer-down handler for the resize gripper.
   * `allWidths` maps every column index to its current rendered width.
   */
  onResizeStart: (
    colIndex: number,
    startX: number,
    allWidths: Record<number, number>,
  ) => void;
}

// ─── Internal types ─────────────────────────────────────

interface IDragInfo {
  colIndex: number;
  adjIndex: number;
  startX: number;
  startWidth: number;
  adjStartWidth: number;
}

// ─── Hook ───────────────────────────────────────────────

export function useColumnResize(
  options: IUseColumnResizeOptions,
): IUseColumnResizeResult {
  const { columnCount, widths, defaultWidths, onChange } = options;

  /* ── Refs (read by native event handlers to avoid stale closures) ── */

  const dragRef = React.useRef<IDragInfo | null>(null);

  /** Live widths for the two active columns (dragged + adjacent). */
  const liveRef = React.useRef<Record<number, number> | null>(null);

  /** Snapshot of ALL column widths captured at drag start. */
  const snapRef = React.useRef<Record<number, number>>({});

  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const colCountRef = React.useRef(columnCount);
  colCountRef.current = columnCount;

  /* ── State (triggers re-renders for visual updates) ────────────── */

  const [liveWidths, setLiveWidths] =
    React.useState<Record<number, number> | null>(null);

  /* ── Global pointer listeners (registered once on mount) ───────── */

  React.useEffect(() => {
    const handlePointerMove = (e: PointerEvent): void => {
      const drag = dragRef.current;
      if (!drag) return;
      e.preventDefault();

      const rawDelta = e.clientX - drag.startX;

      // Dragged column: apply delta, clamp to minimum.
      const newDragged = Math.max(MIN_COL_WIDTH, drag.startWidth + rawDelta);

      // Adjacent column: absorb inverse delta to keep total constant.
      const actualDelta = newDragged - drag.startWidth;
      const newAdj = Math.max(MIN_COL_WIDTH, drag.adjStartWidth - actualDelta);

      const next: Record<number, number> = {
        [drag.colIndex]: newDragged,
        [drag.adjIndex]: newAdj,
      };
      liveRef.current = next;
      setLiveWidths(next);
    };

    const handlePointerUp = (): void => {
      const drag = dragRef.current;
      if (!drag) return;

      const final = liveRef.current;
      if (final) {
        // Commit both affected columns.
        if (final[drag.colIndex] !== undefined) {
          onChangeRef.current(drag.colIndex, final[drag.colIndex]);
        }
        if (final[drag.adjIndex] !== undefined) {
          onChangeRef.current(drag.adjIndex, final[drag.adjIndex]);
        }
      }

      dragRef.current = null;
      liveRef.current = null;
      snapRef.current = {};
      setLiveWidths(null);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Start resize ──────────────────────────────────────────────── */

  const onResizeStart = React.useCallback(
    (
      colIndex: number,
      startX: number,
      allWidths: Record<number, number>,
    ): void => {
      const lastIdx = colCountRef.current - 1;
      // Adjacent column: prefer right neighbour; fall back to left.
      const adjIndex = colIndex < lastIdx ? colIndex + 1 : colIndex - 1;
      if (adjIndex < 0) return; // single-column table — nothing to do

      const startWidth = allWidths[colIndex] || 80;
      const adjStartWidth = allWidths[adjIndex] || 80;

      dragRef.current = { colIndex, adjIndex, startX, startWidth, adjStartWidth };
      snapRef.current = allWidths;

      const initial: Record<number, number> = {
        [colIndex]: startWidth,
        [adjIndex]: adjStartWidth,
      };
      liveRef.current = initial;
      setLiveWidths(initial);
    },
    [],
  );

  /* ── Header style getter ───────────────────────────────────────── */

  const getHeaderStyle = React.useCallback(
    (colIndex: number): React.CSSProperties | undefined => {
      if (liveWidths) {
        // Active columns (dragged + adjacent) → use live values.
        const live = liveWidths[colIndex];
        if (live !== undefined) {
          return { width: live };
        }
        // Other columns → use snapshot to prevent any redistribution.
        const snap = snapRef.current[colIndex];
        if (snap !== undefined) {
          return { width: snap };
        }
      }

      // No active drag → stored width or default.
      const stored = widths[colIndex];
      if (stored !== undefined) {
        return { width: stored };
      }
      const defaultW = defaultWidths ? defaultWidths[colIndex] : undefined;
      if (defaultW !== undefined) {
        return { width: defaultW };
      }
      return undefined;
    },
    [widths, liveWidths, defaultWidths],
  );

  return { getHeaderStyle, onResizeStart };
}
