/**
 * useColumnResize – Hook for interactive column resizing.
 *
 * Attaches pointer-based drag behaviour to column header
 * resize handles. Widths are maintained in local state and
 * communicated to the parent via an onChange callback.
 *
 * Usage:
 *   const { getHeaderStyle, onResizeStart } = useColumnResize({
 *     columnCount,
 *     widths,
 *     onChange,
 *   });
 */

import * as React from "react";
import type { SectionColumnWidths } from "../models/types";

/** Minimum column width in pixels (prevents collapse). */
const MIN_COL_WIDTH = 30;

export interface IUseColumnResizeOptions {
  /** Number of columns in the table. */
  columnCount: number;
  /** Current widths (column index → px). May be sparse. */
  widths: SectionColumnWidths;
  /** Called when the user finishes resizing a column. */
  onChange: (colIndex: number, width: number) => void;
}

export interface IUseColumnResizeResult {
  /**
   * Returns inline style for a `<th>` at the given column index.
   * Applies a fixed width if one is stored; otherwise undefined.
   */
  getHeaderStyle: (colIndex: number) => React.CSSProperties | undefined;

  /**
   * Pointer-down handler to attach to the resize gripper element.
   * Pass the column index so the hook knows which column is being resized.
   */
  onResizeStart: (colIndex: number, startX: number, startWidth: number) => void;
}

export function useColumnResize(
  options: IUseColumnResizeOptions,
): IUseColumnResizeResult {
  const { widths, onChange } = options;

  // Track active drag state in a ref to avoid re-renders during drag.
  const dragRef = React.useRef<{
    colIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Live width during drag (for visual feedback without committing).
  const [liveWidth, setLiveWidth] = React.useState<{
    colIndex: number;
    width: number;
  } | null>(null);

  // ─── Pointer move / up handlers ───────────────────────

  React.useEffect(() => {
    const handlePointerMove = (e: PointerEvent): void => {
      const drag = dragRef.current;
      if (!drag) return;
      e.preventDefault();

      const delta = e.clientX - drag.startX;
      const newWidth = Math.max(MIN_COL_WIDTH, drag.startWidth + delta);
      setLiveWidth({ colIndex: drag.colIndex, width: newWidth });
    };

    const handlePointerUp = (): void => {
      const drag = dragRef.current;
      if (!drag) return;

      // Commit the final width
      const finalState = liveWidth;
      if (finalState && finalState.colIndex === drag.colIndex) {
        onChange(drag.colIndex, finalState.width);
      }

      dragRef.current = null;
      setLiveWidth(null);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [liveWidth, onChange]);

  // ─── Start resize ─────────────────────────────────────

  const onResizeStart = React.useCallback(
    (colIndex: number, startX: number, startWidth: number): void => {
      dragRef.current = { colIndex, startX, startWidth };
      setLiveWidth({ colIndex, width: startWidth });
    },
    [],
  );

  // ─── Header style getter ──────────────────────────────

  const getHeaderStyle = React.useCallback(
    (colIndex: number): React.CSSProperties | undefined => {
      // During active drag, use the live width for the dragged column.
      if (liveWidth && liveWidth.colIndex === colIndex) {
        return { width: liveWidth.width, minWidth: MIN_COL_WIDTH };
      }

      const stored = widths[colIndex];
      if (stored !== undefined) {
        return { width: stored, minWidth: MIN_COL_WIDTH };
      }

      return undefined;
    },
    [widths, liveWidth],
  );

  return { getHeaderStyle, onResizeStart };
}
