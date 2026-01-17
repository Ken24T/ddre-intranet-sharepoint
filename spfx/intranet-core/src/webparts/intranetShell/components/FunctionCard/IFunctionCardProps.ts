/**
 * Card open behavior.
 */
export type CardOpenBehavior = 'inline' | 'newTab' | 'newWindow';

/**
 * Props for FunctionCard component.
 */
export interface IFunctionCardProps {
  /** Unique identifier for the card */
  id: string;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Fluent UI icon name */
  icon: string;
  /** Theme accent color for the card */
  themeColor?: string;
  /** Current open behavior */
  openBehavior?: CardOpenBehavior;
  /** Optional: Card is pinned to top */
  isPinned?: boolean;
  /** Optional: Card is in favourites */
  isFavourite?: boolean;
  /** Optional: User is admin (can hide cards) */
  isAdmin?: boolean;
  /** Optional: Click handler */
  onClick?: () => void;
  /** Optional: Context menu handler */
  onContextMenu?: (
    action:
      | 'pin'
      | 'unpin'
      | 'hide'
      | 'openNewTab'
      | 'addFavourite'
      | 'removeFavourite'
      | 'setOpenInline'
      | 'setOpenNewTab'
      | 'setOpenNewWindow'
  ) => void;
}

/**
 * Function card data model.
 */
export interface IFunctionCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Hub this card belongs to */
  hubKey: string;
  /** URL to navigate to (SharePoint page or external) */
  url?: string;
  /** Preferred open behavior for this card (admin-configurable) */
  openBehavior?: CardOpenBehavior;
  /** Whether to open in new tab */
  openInNewTab?: boolean;
}
