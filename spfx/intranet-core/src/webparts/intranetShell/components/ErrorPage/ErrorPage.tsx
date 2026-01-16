import * as React from 'react';
import { 
  Stack, 
  Text, 
  PrimaryButton, 
  DefaultButton,
  Icon 
} from '@fluentui/react';
import styles from './ErrorPage.module.scss';

export type ErrorPageType = '403' | '404';

export interface IErrorPageProps {
  /** Type of error page to display */
  type: ErrorPageType;
  /** Custom message (overrides default) */
  message?: string;
  /** Handler for home button click */
  onGoHome?: () => void;
  /** Handler for search button click (404 only) */
  onSearch?: () => void;
}

interface IErrorConfig {
  iconName: string;
  title: string;
  defaultMessage: string;
  showSearch: boolean;
}

const ERROR_CONFIGS: Record<ErrorPageType, IErrorConfig> = {
  '403': {
    iconName: 'Lock',
    title: 'Access Denied',
    defaultMessage: 'You don\'t have permission to view this page. If you believe this is an error, please contact your system administrator.',
    showSearch: false,
  },
  '404': {
    iconName: 'Search',
    title: 'Page Not Found',
    defaultMessage: 'The page you\'re looking for doesn\'t exist or may have been moved.',
    showSearch: true,
  },
};

export const ErrorPage: React.FC<IErrorPageProps> = ({
  type,
  message,
  onGoHome,
  onSearch,
}) => {
  const config = ERROR_CONFIGS[type];

  return (
    <div className={styles.errorPage} role="main" aria-labelledby="error-title">
      <Stack 
        className={styles.container}
        horizontalAlign="center"
        verticalAlign="center"
        tokens={{ childrenGap: 24 }}
      >
        <div className={styles.iconWrapper}>
          <Icon 
            iconName={config.iconName} 
            className={styles.icon}
            aria-hidden="true"
          />
        </div>

        <Stack horizontalAlign="center" tokens={{ childrenGap: 8 }}>
          <Text 
            id="error-title"
            variant="xxLarge" 
            className={styles.title}
            block
          >
            {config.title}
          </Text>
          
          <Text 
            variant="medium" 
            className={styles.message}
            block
          >
            {message || config.defaultMessage}
          </Text>
        </Stack>

        <Stack 
          horizontal 
          horizontalAlign="center"
          tokens={{ childrenGap: 12 }}
          className={styles.actions}
        >
          <PrimaryButton
            text="Go to Home"
            iconProps={{ iconName: 'Home' }}
            onClick={onGoHome}
            ariaLabel="Go to home page"
          />
          
          {config.showSearch && (
            <DefaultButton
              text="Search"
              iconProps={{ iconName: 'Search' }}
              onClick={onSearch}
              ariaLabel="Open search"
            />
          )}
        </Stack>

        <Text variant="small" className={styles.errorCode}>
          Error {type}
        </Text>
      </Stack>
    </div>
  );
};

export default ErrorPage;
