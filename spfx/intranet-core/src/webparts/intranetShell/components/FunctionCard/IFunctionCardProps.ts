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
  /** Optional: Card is pinned to top */
  isPinned?: boolean;
  /** Optional: User is admin (can hide cards) */
  isAdmin?: boolean;
  /** Optional: Click handler */
  onClick?: () => void;
  /** Optional: Context menu handler */
  onContextMenu?: (action: 'pin' | 'unpin' | 'hide' | 'openNewTab') => void;
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
  /** Whether to open in new tab */
  openInNewTab?: boolean;
}
