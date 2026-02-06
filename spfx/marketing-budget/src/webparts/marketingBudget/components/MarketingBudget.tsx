import * as React from "react";
import styles from "./MarketingBudget.module.scss";
import type { IMarketingBudgetProps } from "./IMarketingBudgetProps";
import {
  Icon,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Text,
} from "@fluentui/react";
import { getSeedData, SEED_COUNTS } from "../../../models/seedData";
import type { IAppNavItem } from "../../../appBridge";
import { BudgetListView } from "./BudgetListView";
import { SchedulesView } from "./SchedulesView";
import { ServicesView } from "./ServicesView";
import { VendorsView } from "./VendorsView";
import { SuburbsView } from "./SuburbsView";
import { useShellBridge } from "./useShellBridge";

// ─────────────────────────────────────────────────────────────
// App-level navigation definition
// ─────────────────────────────────────────────────────────────

export type AppViewKey =
  | "budgets"
  | "schedules"
  | "services"
  | "vendors"
  | "suburbs";

export const APP_NAV_ITEMS: IAppNavItem[] = [
  { key: "budgets", label: "Budgets", icon: "Financial" },
  { key: "schedules", label: "Schedules", icon: "CalendarWeek" },
  { key: "services", label: "Services", icon: "Settings" },
  { key: "vendors", label: "Vendors", icon: "People" },
  { key: "suburbs", label: "Suburbs", icon: "MapPin" },
];

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
 * Stage 3: View routing + postMessage bridge for shell sidebar integration.
 * When embedded in the intranet shell iframe, this component sends its nav
 * items to the shell and listens for SIDEBAR_NAVIGATE messages. In standalone
 * mode (Vite dev harness or new tab), it renders its own sidebar.
 */
const MarketingBudget: React.FC<IMarketingBudgetProps> = (props) => {
  const { userDisplayName, repository, shellBridgeOptions, userRole = 'viewer' } = props;
  const [counts, setCounts] = React.useState<DataCounts | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [seedComplete, setSeedComplete] = React.useState(false);
  const [activeView, setActiveView] = React.useState<AppViewKey>("budgets");

  // ─── Shell sidebar bridge ────────────────────────────────
  const { isEmbedded } = useShellBridge(activeView, setActiveView, shellBridgeOptions);

  // ─── Data loading ────────────────────────────────────────

  /** Load counts from the repository. */
  const loadCounts = React.useCallback(async (): Promise<DataCounts> => {
    const [vendorList, serviceList, suburbList, scheduleList, budgetList] =
      await Promise.all([
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
      setError(err instanceof Error ? err.message : "Failed to seed data");
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
        if (
          loaded.vendors === 0 &&
          loaded.services === 0 &&
          loaded.suburbs === 0
        ) {
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
          setError(err instanceof Error ? err.message : "Failed to load data");
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

  // ─── View renderer ────────────────────────────────────────

  const renderActiveView = (): React.ReactNode => {
    switch (activeView) {
      case "budgets":
        return <BudgetListView repository={repository} userRole={userRole} />;
      case "schedules":
        return <SchedulesView repository={repository} userRole={userRole} />;
      case "services":
        return <ServicesView repository={repository} userRole={userRole} />;
      case "vendors":
        return <VendorsView repository={repository} userRole={userRole} />;
      case "suburbs":
        return <SuburbsView repository={repository} userRole={userRole} />;
      default:
        return <BudgetListView repository={repository} userRole={userRole} />;
    }
  };

  // ─── Standalone sidebar (non-embedded mode) ───────────────

  const renderStandaloneSidebar = (): React.ReactNode => (
    <nav className={styles.standaloneSidebar}>
      {APP_NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          className={`${styles.navItem} ${activeView === item.key ? styles.navItemActive : ""}`}
          onClick={(): void => setActiveView(item.key as AppViewKey)}
          type="button"
        >
          <Icon iconName={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  // ─── Main content ─────────────────────────────────────────

  const renderMainContent = (): React.ReactNode => (
    <>
      {/* Header is only shown in standalone mode; the shell provides its own. */}
      {!isEmbedded && (
        <div className={styles.header}>
          <div>
            <Text className={styles.title}>Marketing Budgets</Text>
            <Text className={styles.subtitle}>
              G&apos;day {userDisplayName} — manage property marketing budgets
            </Text>
          </div>
        </div>
      )}

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
          Reference data seeded — {SEED_COUNTS.vendors} vendors,{" "}
          {SEED_COUNTS.services} services, {SEED_COUNTS.suburbs} suburbs,{" "}
          {SEED_COUNTS.schedules} schedules loaded.
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
            <Spinner
              size={SpinnerSize.large}
              label={isSeeding ? "Seeding reference data…" : "Loading…"}
            />
          </div>
        )}

        {/* Empty state — offer manual seed */}
        {!isLoading && !isSeeding && !hasData && (
          <div className={styles.placeholder}>
            <Icon
              iconName="Database"
              style={{ fontSize: 48, marginBottom: 16, color: "#001CAD" }}
            />
            <Text variant="large">No reference data found</Text>
            <Text variant="medium" style={{ marginTop: 8, color: "#605e5c" }}>
              Load the standard vendors, services, suburbs, and schedule
              templates to get started.
            </Text>
            <PrimaryButton
              text="Seed Reference Data"
              iconProps={{ iconName: "Add" }}
              onClick={handleSeed}
              style={{ marginTop: 16 }}
            />
          </div>
        )}

        {/* Ready state — show active view */}
        {!isLoading && !isSeeding && hasData && renderActiveView()}
      </div>
    </>
  );

  // ─── Layout ──────────────────────────────────────────────

  if (!isEmbedded) {
    // Standalone mode: render own sidebar alongside content
    return (
      <div className={styles.standaloneLayout}>
        {renderStandaloneSidebar()}
        <div className={styles.standaloneContent}>
          <div className={styles.marketingBudget}>{renderMainContent()}</div>
        </div>
      </div>
    );
  }

  // Embedded mode: no local sidebar, shell provides it via postMessage
  return <div className={styles.marketingBudget}>{renderMainContent()}</div>;
};

export default MarketingBudget;
