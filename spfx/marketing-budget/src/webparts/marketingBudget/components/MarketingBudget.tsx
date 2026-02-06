import * as React from 'react';
import styles from './MarketingBudget.module.scss';
import type { IMarketingBudgetProps } from './IMarketingBudgetProps';
import { Icon, Text } from '@fluentui/react';

/**
 * Root component for the Marketing Budget web part.
 *
 * Stage 1: Skeleton layout with repository connection indicator.
 * Subsequent stages will add budget list, editor, schedule manager, etc.
 */
const MarketingBudget: React.FC<IMarketingBudgetProps> = (props) => {
  const { userDisplayName, repository } = props;
  const [budgetCount, setBudgetCount] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    repository
      .getBudgets()
      .then((budgets) => {
        if (!cancelled) {
          setBudgetCount(budgets.length);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return (): void => {
      cancelled = true;
    };
  }, [repository]);

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

      <div className={styles.content}>
        <div className={styles.placeholder}>
          <Icon iconName="Financial" style={{ fontSize: 48, marginBottom: 16, color: '#001CAD' }} />
          <Text variant="large">
            {isLoading
              ? 'Loading budgets…'
              : `${budgetCount ?? 0} budget${budgetCount === 1 ? '' : 's'} found`}
          </Text>
          <Text variant="medium" style={{ marginTop: 8, color: '#605e5c' }}>
            Budget list and editor coming in Stage 4
          </Text>
        </div>
      </div>
    </div>
  );
};

export default MarketingBudget;
