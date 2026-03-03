/**
 * PortfolioView – Property portfolio grid view.
 *
 * Displays all managed properties as cards with key details.
 * Supports search by address/suburb and status filter.
 * Clicking a card opens a detail panel.
 */

import * as React from "react";
import {
  SearchBox,
  Dropdown,
  type IDropdownOption,
  Panel,
  PanelType,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Icon,
} from "@fluentui/react";
import type {
  IPropertyMeService,
  Property,
  Tenant,
  Owner,
} from "../../services/IPropertyMeService";
import styles from "../PmDashboard.module.scss";

export interface IPortfolioViewProps {
  service: IPropertyMeService;
}

type StatusFilter = "all" | "active" | "inactive";

const STATUS_OPTIONS: IDropdownOption[] = [
  { key: "all", text: "All properties" },
  { key: "active", text: "Active" },
  { key: "inactive", text: "Inactive" },
];

/** Format address parts into a single line. */
function formatAddress(addr: Property["address"]): string {
  return addr.street;
}

function formatSuburb(addr: Property["address"]): string {
  return `${addr.suburb}, ${addr.state} ${addr.postcode}`;
}

function formatRent(property: Property): string {
  if (!property.rentAmount) return "—";
  const amount = "$" + property.rentAmount.toLocaleString("en-AU");
  const freq = property.rentFrequency === "monthly" ? "/mo" : "/wk";
  return amount + freq;
}

export const PortfolioView: React.FC<IPortfolioViewProps> = ({ service }) => {
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("active");

  // Detail panel state
  const [selectedProperty, setSelectedProperty] = React.useState<Property | undefined>();
  const [detailTenant, setDetailTenant] = React.useState<Tenant | undefined>();
  const [detailOwner, setDetailOwner] = React.useState<Owner | undefined>();
  const [detailOpen, setDetailOpen] = React.useState(false);

  // Load properties when filter/search changes
  React.useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await service.listProperties({
          status: statusFilter,
          search: search || undefined,
        });
        if (!cancelled) {
          setProperties(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load properties");
          setLoading(false);
        }
      }
    };

    load().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [service, statusFilter, search]);

  // Open detail panel
  const handleCardClick = React.useCallback(
    async (property: Property): Promise<void> => {
      setSelectedProperty(property);
      setDetailTenant(undefined);
      setDetailOwner(undefined);
      setDetailOpen(true);

      // Load related tenant and owner data
      try {
        if (property.currentTenantId) {
          const tenants = await service.listTenants({ propertyId: property.id });
          if (tenants.length > 0) {
            setDetailTenant(tenants[0]);
          }
        }
        const owners = await service.listOwners();
        const owner = owners.find((o) => o.id === property.ownerId);
        if (owner) {
          setDetailOwner(owner);
        }
      } catch {
        // Non-critical — detail panel still shows property data
      }
    },
    [service],
  );

  const handleDismissDetail = React.useCallback((): void => {
    setDetailOpen(false);
    setSelectedProperty(undefined);
  }, []);

  const handleSearchChange = React.useCallback(
    (_ev?: React.ChangeEvent<HTMLInputElement>, newValue?: string): void => {
      setSearch(newValue || "");
    },
    [],
  );

  const handleStatusChange = React.useCallback(
    (_ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
      if (option) {
        setStatusFilter(option.key as StatusFilter);
      }
    },
    [],
  );

  return (
    <div className={styles.portfolioView}>
      {/* Controls */}
      <div className={styles.portfolioControls}>
        <SearchBox
          placeholder="Search by address or suburb..."
          value={search}
          onChange={handleSearchChange}
          styles={{ root: { width: 280 } }}
        />
        <Dropdown
          selectedKey={statusFilter}
          options={STATUS_OPTIONS}
          onChange={handleStatusChange}
          styles={{ root: { width: 160 } }}
        />
      </div>

      {/* Loading / Error */}
      {loading && (
        <Spinner size={SpinnerSize.small} label="Loading properties..." />
      )}
      {error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}

      {/* Property Grid */}
      {!loading && !error && (
        <div className={styles.portfolioGrid}>
          {properties.map((property) => (
            <div
              key={property.id}
              className={
                property.status === "active"
                  ? styles.propertyCard
                  : styles.propertyCardInactive
              }
              onClick={() => { handleCardClick(property).catch(console.error); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCardClick(property).catch(console.error);
                }
              }}
            >
              <div>
                <div className={styles.propertyAddress}>
                  {formatAddress(property.address)}
                </div>
                <div className={styles.propertySuburb}>
                  {formatSuburb(property.address)}
                </div>
              </div>

              <div className={styles.propertyMeta}>
                {(property.bedrooms || 0) > 0 && (
                  <span className={styles.propertyMetaItem}>
                    <Icon iconName="Hotel" /> {property.bedrooms} bed
                  </span>
                )}
                {(property.bathrooms || 0) > 0 && (
                  <span className={styles.propertyMetaItem}>
                    <Icon iconName="Drop" /> {property.bathrooms} bath
                  </span>
                )}
                <span className={styles.propertyMetaItem}>
                  <Icon iconName="Tag" /> {property.propertyType}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={styles.propertyRent}>
                  {formatRent(property)}
                </span>
                <span
                  className={
                    property.status === "active"
                      ? styles.statusActive
                      : styles.statusInactive
                  }
                >
                  {property.status}
                </span>
              </div>

              {property.currentTenantId ? (
                <span className={styles.propertyTenant}>
                  <Icon iconName="Contact" /> Tenanted
                </span>
              ) : (
                <span className={styles.vacantLabel}>
                  <Icon iconName="Warning" /> Vacant
                </span>
              )}
            </div>
          ))}

          {properties.length === 0 && (
            <div className={styles.emptyState}>
              <Icon iconName="Home" style={{ fontSize: 32 }} />
              <p>No properties found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Panel */}
      <Panel
        isOpen={detailOpen}
        onDismiss={handleDismissDetail}
        type={PanelType.medium}
        headerText={
          selectedProperty
            ? formatAddress(selectedProperty.address)
            : "Property Details"
        }
        isLightDismiss
      >
        {selectedProperty && (
          <div style={{ padding: "16px 0" }}>
            {/* Address */}
            <div className={styles.detailSection}>
              <div className={styles.detailSectionTitle}>Address</div>
              <div className={styles.detailValue}>
                {formatAddress(selectedProperty.address)}
              </div>
              <div className={styles.detailLabel}>
                {formatSuburb(selectedProperty.address)}
              </div>
            </div>

            {/* Property Details */}
            <div className={styles.detailSection}>
              <div className={styles.detailSectionTitle}>Property Details</div>
              <div className={styles.detailGrid}>
                <div>
                  <div className={styles.detailLabel}>Type</div>
                  <div className={styles.detailValue}>
                    {selectedProperty.propertyType}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Status</div>
                  <div className={styles.detailValue}>
                    {selectedProperty.status}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Bedrooms</div>
                  <div className={styles.detailValue}>
                    {selectedProperty.bedrooms}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Bathrooms</div>
                  <div className={styles.detailValue}>
                    {selectedProperty.bathrooms}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Rent</div>
                  <div className={styles.detailValue}>
                    {formatRent(selectedProperty)}
                  </div>
                </div>
              </div>
            </div>

            {/* Tenant */}
            <div className={styles.detailSection}>
              <div className={styles.detailSectionTitle}>Current Tenant</div>
              {detailTenant ? (
                <div className={styles.detailGrid}>
                  <div>
                    <div className={styles.detailLabel}>Name</div>
                    <div className={styles.detailValue}>
                      {detailTenant.firstName} {detailTenant.lastName}
                    </div>
                  </div>
                  <div>
                    <div className={styles.detailLabel}>Email</div>
                    <div className={styles.detailValue}>
                      {detailTenant.email}
                    </div>
                  </div>
                  <div>
                    <div className={styles.detailLabel}>Phone</div>
                    <div className={styles.detailValue}>
                      {detailTenant.phone}
                    </div>
                  </div>
                  <div>
                    <div className={styles.detailLabel}>Lease</div>
                    <div className={styles.detailValue}>
                      {detailTenant.leaseStart} → {detailTenant.leaseEnd}
                    </div>
                  </div>
                </div>
              ) : selectedProperty.currentTenantId ? (
                <Spinner size={SpinnerSize.small} label="Loading..." />
              ) : (
                <div className={styles.vacantLabel}>Vacant</div>
              )}
            </div>

            {/* Owner */}
            <div className={styles.detailSection}>
              <div className={styles.detailSectionTitle}>Owner</div>
              {detailOwner ? (
                <div className={styles.detailGrid}>
                  <div>
                    <div className={styles.detailLabel}>Name</div>
                    <div className={styles.detailValue}>
                      {detailOwner.firstName} {detailOwner.lastName}
                    </div>
                  </div>
                  <div>
                    <div className={styles.detailLabel}>Email</div>
                    <div className={styles.detailValue}>
                      {detailOwner.email}
                    </div>
                  </div>
                  <div>
                    <div className={styles.detailLabel}>Phone</div>
                    <div className={styles.detailValue}>
                      {detailOwner.phone}
                    </div>
                  </div>
                  <div>
                    <div className={styles.detailLabel}>Total Properties</div>
                    <div className={styles.detailValue}>
                      {detailOwner.propertyCount}
                    </div>
                  </div>
                </div>
              ) : (
                <Spinner size={SpinnerSize.small} label="Loading..." />
              )}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
};
