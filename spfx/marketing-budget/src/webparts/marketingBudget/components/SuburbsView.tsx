/**
 * SuburbsView — Stub for suburb/area management.
 * Full implementation coming in Stage 4–5.
 */
import * as React from 'react';
import { Text, Icon } from '@fluentui/react';
import styles from './MarketingBudget.module.scss';

export const SuburbsView: React.FC = () => (
  <div className={styles.viewContainer}>
    <div className={styles.viewHeader}>
      <Text className={styles.viewTitle}>Suburbs</Text>
      <Text className={styles.viewSubtitle}>
        Suburbs and areas used for letterbox distribution targeting.
      </Text>
    </div>
    <div className={styles.centeredState}>
      <Icon iconName="MapPin" style={{ fontSize: 48, marginBottom: 16, color: '#001CAD' }} />
      <Text variant="large">Suburb management coming soon</Text>
      <Text variant="medium" style={{ marginTop: 8, color: '#605e5c' }}>
        View and manage suburb definitions and delivery zones in a future stage.
      </Text>
    </div>
  </div>
);
