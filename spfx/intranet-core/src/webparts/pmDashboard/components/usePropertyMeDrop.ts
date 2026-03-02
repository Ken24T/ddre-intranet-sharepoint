/**
 * usePropertyMeDrop – Hook for PropertyMe drag-and-drop on a section table.
 *
 * Provides HTML5 drag-and-drop event handlers that detect PropertyMe
 * URLs dragged from the browser or sent by the PropertyMe extension.
 * Returns drag state for visual feedback and a set of event handlers
 * to attach to the drop target element.
 */

import * as React from "react";
import type { DashboardSection } from "../models/types";
import {
  extractFromDragEvent,
  mightContainPropertyMeData,
  type IPropertyMeDropResult,
} from "../models/propertyMeDragHelpers";

export interface IUsePropertyMeDropOptions {
  /** Which section this drop target belongs to. */
  section: DashboardSection;
  /** Called when a valid PropertyMe property is dropped. */
  onDrop: (section: DashboardSection, result: IPropertyMeDropResult) => void;
  /** Whether drops are disabled (e.g. no PM selected). */
  disabled?: boolean;
}

export interface IPropertyMeDropState {
  /** Whether a drag is currently hovering over the drop zone. */
  isDragOver: boolean;
}

export interface IPropertyMeDropHandlers {
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

/**
 * Hook that manages PropertyMe drag-and-drop state for a section table.
 *
 * @returns State object and event handlers to spread onto the drop target.
 */
export function usePropertyMeDrop(
  options: IUsePropertyMeDropOptions,
): { state: IPropertyMeDropState; handlers: IPropertyMeDropHandlers } {
  const { section, onDrop, disabled = false } = options;
  const [isDragOver, setIsDragOver] = React.useState(false);

  // Track enter/leave depth to handle nested elements correctly
  const depthRef = React.useRef(0);

  const handleDragOver = React.useCallback(
    (e: React.DragEvent): void => {
      if (disabled) return;
      if (!mightContainPropertyMeData(e.dataTransfer)) return;

      // Allow drop
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    [disabled],
  );

  const handleDragEnter = React.useCallback(
    (e: React.DragEvent): void => {
      if (disabled) return;
      if (!mightContainPropertyMeData(e.dataTransfer)) return;

      e.preventDefault();
      depthRef.current += 1;
      if (depthRef.current === 1) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent): void => {
      if (disabled) return;
      e.preventDefault();

      depthRef.current -= 1;
      if (depthRef.current <= 0) {
        depthRef.current = 0;
        setIsDragOver(false);
      }
    },
    [disabled],
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent): void => {
      // Always reset drag state
      depthRef.current = 0;
      setIsDragOver(false);

      if (disabled) return;

      e.preventDefault();
      e.stopPropagation();

      const result = extractFromDragEvent(e.dataTransfer);
      if (result) {
        onDrop(section, result);
      }
    },
    [disabled, onDrop, section],
  );

  return {
    state: { isDragOver },
    handlers: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
