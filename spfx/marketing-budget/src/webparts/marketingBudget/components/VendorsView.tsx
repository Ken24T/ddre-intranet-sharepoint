/**
 * VendorsView — Stub for vendor management.
 * Full implementation coming in Stage 4–5.
 */
import * as React from 'react';
import { Text, Icon } from '@fluentui/react';
import styles from './MarketingBudget.module.scss';

export const VendorsView: React.FC = () => (
  <div className={styles.viewContainer}>
    <div className={styles.viewHeader}>
      <Text className={styles.viewTitle}>Vendors</Text>
      <Text className={styles.viewSubtitle}>
        External vendors who provide marketing services.
      </Text>
    </div>
    <div className={styles.centeredState}>
      <Icon iconName="People" style={{ fontSize: 48, marginBottom: 16, color: '#001CAD' }} />
      <Text variant="large">Vendor management coming soon</Text>
      <Text variant="medium" style={{ marginTop: 8, color: '#605e5c' }}>
        View and manage vendor details and their services in a future stage.
      </Text>
    </div>
  </div>
);
