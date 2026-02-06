/**
 * SuburbsView — Browse suburbs and their pricing tiers.
 *
 * Displays suburbs in a DetailsList grouped/filterable by pricing tier.
 * Suburbs are read-only reference data (managed via seed import).
 */

import * as React from "react";
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  Text,
  Icon,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  SearchBox,
  Dropdown,
} from "@fluentui/react";
import type { IColumn, IDropdownOption } from "@fluentui/react";
import type { Suburb, PricingTier } from "../../../models/types";
import type { IBudgetRepository } from "../../../services/IBudgetRepository";
import styles from "./MarketingBudget.module.scss";

export interface ISuburbsViewProps {
  repository: IBudgetRepository;
}

interface ISuburbRow {
  key: string;
  id: number;
  name: string;
  pricingTier: string;
  postcode: string;
  state: string;
}

const tierColours: Record<PricingTier, string> = {
  A: "#107c10",
  B: "#0078d4",
  C: "#ca5010",
  D: "#d13438",
};

const tierOptions: IDropdownOption[] = [
  { key: "all", text: "All tiers" },
  { key: "A", text: "Tier A" },
  { key: "B", text: "Tier B" },
  { key: "C", text: "Tier C" },
  { key: "D", text: "Tier D" },
];

export const SuburbsView: React.FC<ISuburbsViewProps> = ({ repository }) => {
  const [suburbs, setSuburbs] = React.useState<Suburb[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [searchText, setSearchText] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState("all");

  React.useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const result = await repository.getSuburbs();
        if (!cancelled) setSuburbs(result);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load suburbs",
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load(); // eslint-disable-line @typescript-eslint/no-floating-promises
    return (): void => {
      cancelled = true;
    };
  }, [repository]);

  const rows: ISuburbRow[] = React.useMemo(() => {
    const lowerSearch = searchText.toLowerCase();
    return suburbs
      .filter((s) => {
        if (tierFilter !== "all" && s.pricingTier !== tierFilter) return false;
        if (searchText && !s.name.toLowerCase().includes(lowerSearch))
          return false;
        return true;
      })
      .map((s) => ({
        key: String(s.id ?? 0),
        id: s.id ?? 0,
        name: s.name,
        pricingTier: s.pricingTier,
        postcode: s.postcode ?? "—",
        state: s.state ?? "QLD",
      }));
  }, [suburbs, searchText, tierFilter]);

  /** Tier summary counts. */
  const tierCounts = React.useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (const s of suburbs) {
      counts[s.pricingTier] = (counts[s.pricingTier] ?? 0) + 1;
    }
    return counts;
  }, [suburbs]);

  const columns: IColumn[] = React.useMemo(
    (): IColumn[] => [
      {
        key: "name",
        name: "Suburb",
        fieldName: "name",
        minWidth: 150,
        maxWidth: 250,
        isResizable: true,
      },
      {
        key: "tier",
        name: "Pricing Tier",
        fieldName: "pricingTier",
        minWidth: 90,
        maxWidth: 120,
        isResizable: true,
        onRender: (item: ISuburbRow): JSX.Element => (
          <Text
            variant="small"
            style={{
              fontWeight: 600,
              color: tierColours[item.pricingTier as PricingTier] ?? "#323130",
            }}
          >
            Tier {item.pricingTier}
          </Text>
        ),
      },
      {
        key: "postcode",
        name: "Postcode",
        fieldName: "postcode",
        minWidth: 70,
        maxWidth: 100,
        isResizable: true,
      },
      {
        key: "state",
        name: "State",
        fieldName: "state",
        minWidth: 50,
        maxWidth: 80,
        isResizable: true,
      },
    ],
    [],
  );

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <Text className={styles.viewTitle}>Suburbs</Text>
        <Text className={styles.viewSubtitle}>
          Suburbs and their pricing tiers used for internet listing package
          selection.
        </Text>
      </div>

      {error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          onDismiss={(): void => setError(undefined)}
          dismissButtonAriaLabel="Close"
        >
          {error}
        </MessageBar>
      )}

      {/* Tier summary badges */}
      {!isLoading && suburbs.length > 0 && (
        <div className={styles.tierSummary}>
          {(["A", "B", "C", "D"] as PricingTier[]).map((tier) => (
            <div
              key={tier}
              className={styles.tierBadge}
              style={{ borderColor: tierColours[tier] }}
            >
              <Text
                variant="small"
                style={{ fontWeight: 600, color: tierColours[tier] }}
              >
                Tier {tier}
              </Text>
              <Text variant="small">
                {tierCounts[tier]} suburb{tierCounts[tier] !== 1 ? "s" : ""}
              </Text>
            </div>
          ))}
        </div>
      )}

      <div className={styles.filterBar}>
        <SearchBox
          placeholder="Search suburbs…"
          value={searchText}
          onChange={(_, val): void => setSearchText(val ?? "")}
          className={styles.filterSearch}
        />
        <Dropdown
          placeholder="Pricing tier"
          options={tierOptions}
          selectedKey={tierFilter}
          onChange={(_, option): void =>
            setTierFilter(String(option?.key ?? "all"))
          }
          className={styles.filterDropdown}
        />
      </div>

      {isLoading ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading suburbs…" />
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.centeredState}>
          <Icon
            iconName="MapPin"
            style={{ fontSize: 48, marginBottom: 16, color: "#001CAD" }}
          />
          <Text variant="large">No suburbs found</Text>
          <Text variant="medium" style={{ marginTop: 8, color: "#605e5c" }}>
            Suburbs are loaded with reference data.
          </Text>
        </div>
      ) : (
        <DetailsList
          items={rows}
          columns={columns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          isHeaderVisible={true}
        />
      )}
    </div>
  );
};
