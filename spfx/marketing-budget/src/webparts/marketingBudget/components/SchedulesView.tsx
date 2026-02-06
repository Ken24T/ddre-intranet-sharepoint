/**
 * SchedulesView — Stub for schedule management.
 * Full implementation coming in Stage 4–5.
 */
import * as React from 'react';
import { Text, Icon } from '@fluentui/react';
import styles from './MarketingBudget.module.scss';

export const SchedulesView: React.FC = () => (
  <div className={styles.viewContainer}>
    <div className={styles.viewHeader}>
      <Text className={styles.viewTitle}>Schedules</Text>
      <Text className={styles.viewSubtitle}>
        Distribution schedules define how letterbox drops are executed.
      </Text>
    </div>
    <div className={styles.centeredState}>
      <Icon iconName="CalendarWeek" style={{ fontSize: 48, marginBottom: 16, color: '#001CAD' }} />
      <Text variant="large">Schedule management coming soon</Text>
      <Text variant="medium" style={{ marginTop: 8, color: '#605e5c' }}>
        View and manage distribution schedules in a future stage.
      </Text>
    </div>
  </div>
);
