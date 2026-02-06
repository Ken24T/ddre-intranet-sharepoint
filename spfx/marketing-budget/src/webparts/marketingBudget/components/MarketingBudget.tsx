import * as React from 'react';
import styles from './MarketingBudget.module.scss';
import type { IMarketingBudgetProps } from './IMarketingBudgetProps';
import { Icon, MessageBar, MessageBarType, PrimaryButton, Spinner, SpinnerSize, Text } from '@fluentui/react';
import { getSeedData, SEED_COUNTS } from '../../../models/seedData';

/** Counts returned after loading reference data. */
interface DataCounts {
  vendors: number;
  services: number;
  suburbs: number;
  schedules: number;
  budgets: number;
}

/**
 * Root component for the Marketing Budget web part.
 *
 * Stage 2: Auto-seeds reference data on first load and displays
 * a data status bar showing entity counts.
 */
const MarketingBudget: React.FC<IMarketingBudgetProps> = (props) => {
  const { userDisplayName, repository } = props;
  const [counts, setCounts] = React.useState<DataCounts | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [seedComplete, setSeedComplete] = React.useState(false);

  /** Load counts from the repository. */
  const loadCounts = React.useCallback(async (): Promise<DataCounts> => {
    const [vendorList, serviceList, suburbList, scheduleList, budgetList] = await Promise.all([
      repository.getVendors(),
      repository.getServices(),
      repository.getSuburbs(),
      repository.getSchedules(),
      repository.getBudgets(),
    ]);
    return {
      vendors: vendorList.length,
      services: serviceList.length,
      suburbs: suburbList.length,
      schedules: scheduleList.length,
      budgets: budgetList.length,
    };
  }, [repository]);

  /** Seed reference data and refresh counts. */
  const handleSeed = React.useCallback(async (): Promise<void> => {
    setIsSeeding(true);
    setError(null);
    try {
      await repository.seedData(getSeedData());
      const refreshed = await loadCounts();
      setCounts(refreshed);
      setSeedComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed data');
    } finally {
      setIsSeeding(false);
    }
  }, [repository, loadCounts]);

  // Auto-seed on first load if the database is empty
  React.useEffect(() => {
    let cancelled = false;

    const init = async (): Promise<void> => {
      try {
        const loaded = await loadCounts();
        if (cancelled) return;

        // Auto-seed when the database has no reference data at all
        if (loaded.vendors === 0 && loaded.services === 0 && loaded.suburbs === 0) {
          setIsSeeding(true);
          await repository.seedData(getSeedData());
          if (cancelled) return;

          const refreshed = await loadCounts();
          if (cancelled) return;
          setCounts(refreshed);
          setSeedComplete(true);
          setIsSeeding(false);
        } else {
          setCounts(loaded);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init(); // eslint-disable-line @typescript-eslint/no-floating-promises

    return (): void => {
      cancelled = true;
    };
  }, [repository, loadCounts]);

  const hasData = counts !== null && counts.services > 0;

  return (
    <div className={styles.marketingBudget}>
      <div className={styles.header}>
        <div>
          <Text className={styles.title}>Marketing Budgets</Text>
          <Text className={styles.subtitle}>
            G&apos;day {userDisplayName} — manage property marketing budgets
          </Text>
        </div>
      </div>

      {/* Error bar */}
      {error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          onDismiss={(): void => setError(null)}
          dismissButtonAriaLabel="Close"
        >
          {error}
        </MessageBar>
      )}

      {/* Seed complete notification */}
      {seedComplete && (
        <MessageBar
          messageBarType={MessageBarType.success}
          onDismiss={(): void => setSeedComplete(false)}
          dismissButtonAriaLabel="Close"
        >
          Reference data seeded — {SEED_COUNTS.vendors} vendors, {SEED_COUNTS.services} services,{' '}
          {SEED_COUNTS.suburbs} suburbs, {SEED_COUNTS.schedules} schedules loaded.
        </MessageBar>
      )}

      {/* Data status bar */}
      {counts && (
        <div className={styles.statusBar}>
          <div className={styles.statusItem}>
            <Icon iconName="People" />
            <Text variant="small">{counts.vendors} vendors</Text>
          </div>
          <div className={styles.statusItem}>
            <Icon iconName="Settings" />
            <Text variant="small">{counts.services} services</Text>
          </div>
          <div className={styles.statusItem}>
            <Icon iconName="MapPin" />
            <Text variant="small">{counts.suburbs} suburbs</Text>
          </div>
          <div className={styles.statusItem}>
            <Icon iconName="CalendarWeek" />
            <Text variant="small">{counts.schedules} schedules</Text>
          </div>
          <div className={styles.statusItem}>
            <Icon iconName="Financial" />
            <Text variant="small">{counts.budgets} budgets</Text>
          </div>
        </div>
      )}

      <div className={styles.content}>
        {/* Loading state */}
        {(isLoading || isSeeding) && (
          <div className={styles.placeholder}>
            <Spinner size={SpinnerSize.large} label={isSeeding ? 'Seeding reference data…' : 'Loading…'} />
          </div>
        )}

        {/* Empty state — offer manual seed */}
        {!isLoading && !isSeeding && !hasData && (
          <div className={styles.placeholder}>
            <Icon iconName="Database" style={{ fontSize: 48, marginBottom: 16, color: '#001CAD' }} />
            <Text variant="large">No reference data found</Text>
            <Text variant="medium" style={{ marginTop: 8, color: '#605e5c' }}>
              Load the standard vendors, services, suburbs, and schedule templates to get started.
            </Text>
            <PrimaryButton
              text="Seed Reference Data"
              iconProps={{ iconName: 'Add' }}
              onClick={handleSeed}
              style={{ marginTop: 16 }}
            />
          </div>
        )}

        {/* Ready state */}
        {!isLoading && !isSeeding && hasData && (
          <div className={styles.placeholder}>
            <Icon iconName="Financial" style={{ fontSize: 48, marginBottom: 16, color: '#001CAD' }} />
            <Text variant="large">
              {counts.budgets} budget{counts.budgets === 1 ? '' : 's'} found
            </Text>
            <Text variant="medium" style={{ marginTop: 8, color: '#605e5c' }}>
              Budget list and editor coming in Stage 4
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingBudget;
