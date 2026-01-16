import * as React from 'react';
import { 
  PrimaryButton, 
  DefaultButton, 
  Icon,
} from '@fluentui/react';
import { Modal } from './Modal';
import styles from './ConfirmationDialog.module.scss';

// =============================================================================
// TYPES
// =============================================================================

export type ConfirmationVariant = 'default' | 'destructive';

export interface IConfirmationDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Handler when dialog is dismissed (Cancel) */
  onDismiss: () => void;
  /** Handler when confirmed */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Main message */
  message: string;
  /** Optional detailed description */
  description?: string;
  /** Confirm button text (default: "Confirm") */
  confirmText?: string;
  /** Cancel button text (default: "Cancel") */
  cancelText?: string;
  /** Visual variant (default or destructive) */
  variant?: ConfirmationVariant;
  /** Whether confirm action is in progress */
  isConfirming?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Confirmation dialog for destructive or important actions.
 * 
 * Features:
 * - Blocking modal (backdrop click doesn't close)
 * - Warning icon for destructive variant
 * - Clear action buttons with appropriate styling
 * - Loading state support for async confirmations
 * 
 * @example
 * ```tsx
 * <ConfirmationDialog
 *   isOpen={showReset}
 *   onDismiss={() => setShowReset(false)}
 *   onConfirm={handleReset}
 *   title="Reset Settings"
 *   message="Reset all settings to defaults?"
 *   description="This will restore theme, sidebar, and all customizations. This cannot be undone."
 *   confirmText="Reset"
 *   variant="destructive"
 * />
 * ```
 */
// Simple ID generator for React 17 compatibility
let dialogIdCounter = 0;
const generateDialogId = (prefix: string): string => `${prefix}-${++dialogIdCounter}`;

export const ConfirmationDialog: React.FC<IConfirmationDialogProps> = ({
  isOpen,
  onDismiss,
  onConfirm,
  title,
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isConfirming = false,
}) => {
  const descriptionId = React.useRef(generateDialogId('dialog-desc')).current;
  const isDestructive = variant === 'destructive';

  const footer = (
    <>
      <DefaultButton
        text={cancelText}
        onClick={onDismiss}
        disabled={isConfirming}
      />
      <PrimaryButton
        text={confirmText}
        onClick={onConfirm}
        disabled={isConfirming}
        className={isDestructive ? styles.destructiveButton : undefined}
      />
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      title={title}
      size="small"
      isBlocking={true}
      showCloseButton={true}
      footer={footer}
      ariaDescribedBy={descriptionId}
    >
      <div className={styles.content}>
        {isDestructive && (
          <div className={styles.iconWrapper}>
            <Icon iconName="Warning" className={styles.warningIcon} />
          </div>
        )}
        <div className={styles.text}>
          <p className={styles.message}>{message}</p>
          {description && (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
