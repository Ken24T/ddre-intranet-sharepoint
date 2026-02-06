/**
 * ServicesView — Stub for service/product management.
 * Full implementation coming in Stage 4–5.
 */
import * as React from 'react';
import { Text, Icon } from '@fluentui/react';
import styles from './MarketingBudget.module.scss';

export const ServicesView: React.FC = () => (
  <div className={styles.viewContainer}>
    <div className={styles.viewHeader}>
      <Text className={styles.viewTitle}>Services</Text>
      <Text className={styles.viewSubtitle}>
        Marketing services and products available for property budgets.
      </Text>
    </div>
    <div className={styles.centeredState}>
      <Icon iconName="Settings" style={{ fontSize: 48, marginBottom: 16, color: '#001CAD' }} />
      <Text variant="large">Service management coming soon</Text>
      <Text variant="medium" style={{ marginTop: 8, color: '#605e5c' }}>
        View and manage services and their variant pricing in a future stage.
      </Text>
    </div>
  </div>
);
