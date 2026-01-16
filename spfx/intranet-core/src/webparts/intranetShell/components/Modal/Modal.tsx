import * as React from 'react';
import { 
  Modal as FluentModal, 
  IconButton, 
  IModalProps as IFluentModalProps,
  mergeStyleSets,
  getTheme,
} from '@fluentui/react';
import styles from './Modal.module.scss';

// =============================================================================
// TYPES
// =============================================================================

export type ModalSize = 'small' | 'medium' | 'large';

export interface IModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler when modal is dismissed */
  onDismiss: () => void;
  /** Modal title */
  title: string;
  /** Modal size (small: 400px, medium: 560px, large: 720px) */
  size?: ModalSize;
  /** Whether clicking the backdrop closes the modal */
  isBlocking?: boolean;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Footer content (usually buttons) */
  footer?: React.ReactNode;
  /** Modal content */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Aria describedby for accessibility */
  ariaDescribedBy?: string;
}

// =============================================================================
// SIZE CONFIG
// =============================================================================

const SIZE_MAP: Record<ModalSize, number> = {
  small: 400,
  medium: 560,
  large: 720,
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Base Modal component with consistent styling and accessibility.
 * 
 * Features:
 * - Configurable sizes (small/medium/large)
 * - Focus trap (via Fluent UI)
 * - ESC key closes modal
 * - Backdrop click behavior (configurable)
 * - Smooth open/close animations
 * 
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onDismiss={() => setIsOpen(false)}
 *   title="Settings"
 *   size="medium"
 *   footer={<PrimaryButton onClick={handleSave}>Save</PrimaryButton>}
 * >
 *   <p>Modal content here</p>
 * </Modal>
 * ```
 */
// Simple ID generator for React 17 compatibility (no useId)
let idCounter = 0;
const generateId = (prefix: string): string => `${prefix}-${++idCounter}`;

export const Modal: React.FC<IModalProps> = ({
  isOpen,
  onDismiss,
  title,
  size = 'medium',
  isBlocking = false,
  showCloseButton = true,
  footer,
  children,
  className,
  ariaDescribedBy,
}) => {
  const titleId = React.useRef(generateId('modal-title')).current;
  const theme = getTheme();

  // Fluent UI modal styles
  const modalStyles = React.useMemo(() => mergeStyleSets({
    main: {
      maxWidth: SIZE_MAP[size],
      minWidth: 320,
      maxHeight: '80vh',
      borderRadius: 8,
      boxShadow: theme.effects.elevation64,
    },
    scrollableContent: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '80vh',
    },
  }), [size, theme]);

  const modalProps: IFluentModalProps = {
    isOpen,
    onDismiss,
    isBlocking,
    containerClassName: className || '',
    styles: modalStyles,
    titleAriaId: titleId,
    subtitleAriaId: ariaDescribedBy,
  };

  return (
    <FluentModal {...modalProps}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        {/* Header */}
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>{title}</h2>
          {showCloseButton && (
            <IconButton
              className={styles.closeButton}
              iconProps={{ iconName: 'Cancel' }}
              ariaLabel="Close"
              onClick={onDismiss}
            />
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </FluentModal>
  );
};

export default Modal;
