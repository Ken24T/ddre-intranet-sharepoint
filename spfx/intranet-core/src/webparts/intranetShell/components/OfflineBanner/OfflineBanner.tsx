import * as React from 'react';
import { 
  MessageBar, 
  MessageBarType, 
  MessageBarButton,
  Icon 
} from '@fluentui/react';
import styles from './OfflineBanner.module.scss';

export interface IOfflineBannerProps {
  /** Whether to show the banner */
  isVisible: boolean;
  /** Handler for dismiss button */
  onDismiss?: () => void;
  /** Custom message (overrides default) */
  message?: string;
}

export const OfflineBanner: React.FC<IOfflineBannerProps> = ({
  isVisible,
  onDismiss,
  message,
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.offlineBanner} role="alert" aria-live="assertive">
      <MessageBar
        messageBarType={MessageBarType.warning}
        isMultiline={false}
        onDismiss={onDismiss}
        dismissButtonAriaLabel="Dismiss offline warning"
        actions={
          onDismiss ? (
            <MessageBarButton onClick={onDismiss}>Dismiss</MessageBarButton>
          ) : undefined
        }
      >
        <span className={styles.content}>
          <Icon iconName="WifiWarning4" className={styles.icon} />
          <span className={styles.message}>
            {message || "You're offline. Some features may be unavailable until you reconnect."}
          </span>
        </span>
      </MessageBar>
    </div>
  );
};

export default OfflineBanner;
