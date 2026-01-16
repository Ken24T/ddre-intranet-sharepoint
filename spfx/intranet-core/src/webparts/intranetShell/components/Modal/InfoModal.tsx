import * as React from 'react';
import { 
  PrimaryButton, 
  Icon,
} from '@fluentui/react';
import { Modal } from './Modal';
import styles from './InfoModal.module.scss';

// =============================================================================
// TYPES
// =============================================================================

export type InfoType = 'info' | 'success' | 'warning' | 'error';

export interface IInfoModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler when modal is dismissed */
  onDismiss: () => void;
  /** Modal title */
  title: string;
  /** Main message */
  message: string;
  /** Optional detailed content */
  children?: React.ReactNode;
  /** Info type (affects icon and color) */
  type?: InfoType;
  /** Action button text (default: "Got it") */
  actionText?: string;
  /** Optional secondary action */
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

// =============================================================================
// TYPE CONFIG
// =============================================================================

interface ITypeConfig {
  iconName: string;
  className: string;
}

const TYPE_CONFIG: Record<InfoType, ITypeConfig> = {
  info: { iconName: 'Info', className: 'info' },
  success: { iconName: 'CheckMark', className: 'success' },
  warning: { iconName: 'Warning', className: 'warning' },
  error: { iconName: 'ErrorBadge', className: 'error' },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Info/Alert modal for system messages and announcements.
 * 
 * Features:
 * - Type-based styling (info, success, warning, error)
 * - Single primary action (closes modal)
 * - Optional secondary action
 * - Non-blocking (backdrop click closes)
 * 
 * @example
 * ```tsx
 * <InfoModal
 *   isOpen={showAnnouncement}
 *   onDismiss={() => setShowAnnouncement(false)}
 *   title="System Maintenance"
 *   message="The intranet will be unavailable on Saturday from 10pm to 2am AEST."
 *   type="info"
 * />
 * ```
 */
export const InfoModal: React.FC<IInfoModalProps> = ({
  isOpen,
  onDismiss,
  title,
  message,
  children,
  type = 'info',
  actionText = 'Got it',
  secondaryAction,
}) => {
  const config = TYPE_CONFIG[type];

  const footer = (
    <>
      {secondaryAction && (
        <PrimaryButton
          text={secondaryAction.text}
          onClick={secondaryAction.onClick}
          styles={{ root: { marginRight: 'auto' } }}
        />
      )}
      <PrimaryButton text={actionText} onClick={onDismiss} />
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      title={title}
      size="small"
      isBlocking={false}
      footer={footer}
    >
      <div className={styles.content}>
        <div className={`${styles.iconWrapper} ${(styles as unknown as Record<string, string>)[config.className]}`}>
          <Icon iconName={config.iconName} className={styles.icon} />
        </div>
        <div className={styles.text}>
          <p className={styles.message}>{message}</p>
          {children && <div className={styles.details}>{children}</div>}
        </div>
      </div>
    </Modal>
  );
};

export default InfoModal;
