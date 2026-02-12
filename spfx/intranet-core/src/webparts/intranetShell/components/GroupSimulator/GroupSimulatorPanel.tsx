/**
 * GroupSimulatorPanel — Dev-only panel for simulating SP group membership.
 *
 * Activated by Ctrl+Shift+G (hidden keyboard shortcut). Lets developers
 * pick which DDRE-* groups a simulated user belongs to, then the entire
 * shell (hub visibility, admin state, MB role) reacts accordingly.
 *
 * ⚠️  This panel is for development/testing only.
 *     It does NOT appear in production — the shell only renders it
 *     when onToggleAdmin is provided (Vite dev harness only).
 */

import * as React from 'react';
import {
  Panel,
  PanelType,
  Checkbox,
  Separator,
  Text,
  MessageBar,
  MessageBarType,
  Icon,
} from '@fluentui/react';
import type { IPanelStyles } from '@fluentui/react';

// ─────────────────────────────────────────────────────────────
// All DDRE-* groups (hub-level + app-level)
// ─────────────────────────────────────────────────────────────

export interface IGroupDefinition {
  /** SP group name exactly as configured in SharePoint */
  name: string;
  /** Human-readable description for the panel */
  description: string;
  /** Category for visual grouping */
  category: 'hub' | 'app';
}

/** All known DDRE-* groups across the intranet. */
export const ALL_GROUPS: IGroupDefinition[] = [
  // Hub-level groups (affect sidebar visibility)
  { name: 'DDRE-Admins', description: 'Site-wide admin — sees all hubs', category: 'hub' },
  { name: 'DDRE-Sales', description: 'Unlocks Sales hub', category: 'hub' },
  { name: 'DDRE-PropertyManagement', description: 'Unlocks Property Management hub', category: 'hub' },
  { name: 'DDRE-Office', description: 'Unlocks Office hub', category: 'hub' },

  // App-level groups (affect in-app permissions)
  { name: 'DDRE-MarketingBudget-Admins', description: 'MB admin role', category: 'app' },
  { name: 'DDRE-MarketingBudget-Editors', description: 'MB editor role', category: 'app' },
];

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

export interface IGroupSimulatorPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Called when the panel should close */
  onDismiss: () => void;
  /** Currently selected group names */
  selectedGroups: string[];
  /** Called when the group selection changes */
  onGroupsChange: (groups: string[]) => void;
  /** Called to deactivate the simulator entirely (return to real SP groups) */
  onReset?: () => void;
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const panelStyles: Partial<IPanelStyles> = {
  main: {
    maxWidth: 360,
  },
  content: {
    padding: '16px 24px',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 600,
  },
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
  marginTop: 16,
};

const checkboxContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginLeft: 4,
};

const descriptionStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#605e5c',
  marginLeft: 26,
  marginTop: -4,
};

const badgeStyle: React.CSSProperties = {
  background: '#001CAD',
  color: 'white',
  fontSize: 10,
  padding: '2px 6px',
  borderRadius: 3,
  fontWeight: 600,
  letterSpacing: 0.5,
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const GroupSimulatorPanel: React.FC<IGroupSimulatorPanelProps> = ({
  isOpen,
  onDismiss,
  selectedGroups,
  onGroupsChange,
  onReset,
}) => {
  const handleToggle = React.useCallback(
    (groupName: string, checked: boolean) => {
      if (checked) {
        onGroupsChange([...selectedGroups, groupName]);
      } else {
        onGroupsChange(selectedGroups.filter((g) => g !== groupName));
      }
    },
    [selectedGroups, onGroupsChange],
  );

  const hubGroups = ALL_GROUPS.filter((g) => g.category === 'hub');
  const appGroups = ALL_GROUPS.filter((g) => g.category === 'app');

  const isAdmin = selectedGroups.indexOf('DDRE-Admins') !== -1;

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      headerText="Group Simulator"
      type={PanelType.custom}
      customWidth="360px"
      styles={panelStyles}
      isLightDismiss
    >
      <MessageBar
        messageBarType={MessageBarType.warning}
        styles={{ root: { marginBottom: 16 } }}
      >
        Dev only — simulates SP group membership for testing.
        Press <strong>Ctrl+Shift+G</strong> to toggle this panel.
      </MessageBar>

      {selectedGroups.length === 0 && (
        <MessageBar
          messageBarType={MessageBarType.info}
          styles={{ root: { marginBottom: 16 } }}
        >
          No groups selected — user sees only Home, Library, and Help.
          Marketing Budget role defaults to <strong>viewer</strong>.
        </MessageBar>
      )}

      {/* Hub-level groups */}
      <div style={sectionHeaderStyle}>
        <Icon iconName="Globe" />
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
          Hub Access Groups
        </Text>
      </div>
      <Separator />
      <div style={checkboxContainerStyle}>
        {hubGroups.map((group) => (
          <div key={group.name}>
            <Checkbox
              label={group.name}
              checked={selectedGroups.indexOf(group.name) !== -1}
              onChange={(_ev, checked) => handleToggle(group.name, !!checked)}
            />
            <div style={descriptionStyle}>{group.description}</div>
          </div>
        ))}
      </div>

      {/* App-level groups */}
      <div style={sectionHeaderStyle}>
        <Icon iconName="AppIconDefaultList" />
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
          App Permission Groups
        </Text>
      </div>
      <Separator />
      <div style={checkboxContainerStyle}>
        {appGroups.map((group) => (
          <div key={group.name}>
            <Checkbox
              label={group.name}
              checked={selectedGroups.indexOf(group.name) !== -1}
              onChange={(_ev, checked) => handleToggle(group.name, !!checked)}
            />
            <div style={descriptionStyle}>{group.description}</div>
          </div>
        ))}
      </div>

      {/* Effective access summary */}
      <div style={sectionHeaderStyle}>
        <Icon iconName="Shield" />
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
          Effective Access
        </Text>
      </div>
      <Separator />
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Text styles={{ root: { fontWeight: 600, minWidth: 100 } }}>Shell admin:</Text>
          <span style={isAdmin ? { ...badgeStyle, background: '#107c10' } : { ...badgeStyle, background: '#a80000' }}>
            {isAdmin ? 'YES' : 'NO'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Text styles={{ root: { fontWeight: 600, minWidth: 100 } }}>MB role:</Text>
          <span style={badgeStyle}>
            {getSimulatedMBRole(selectedGroups).toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Text styles={{ root: { fontWeight: 600, minWidth: 100 } }}>Visible hubs:</Text>
          <span style={{ fontSize: 12, color: '#323130' }}>
            {isAdmin ? 'All hubs' : getSimulatedVisibleHubLabels(selectedGroups)}
          </span>
        </div>
      </div>

      {/* Reset button */}
      {onReset && (
        <>
          <Separator styles={{ root: { marginTop: 20 } }} />
          <button
            type="button"
            onClick={onReset}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #a19f9d',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              color: '#323130',
              width: '100%',
            }}
          >
            Reset — use real SP groups
          </button>
        </>
      )}
    </Panel>
  );
};

// ─────────────────────────────────────────────────────────────
// Simulation logic (mirrors ShellGroupResolver + RoleResolver)
// ─────────────────────────────────────────────────────────────

/** Resolve MB role from simulated group membership. */
export function getSimulatedMBRole(groups: string[]): 'admin' | 'editor' | 'viewer' {
  if (groups.indexOf('DDRE-MarketingBudget-Admins') !== -1) return 'admin';
  if (groups.indexOf('DDRE-MarketingBudget-Editors') !== -1) return 'editor';
  return 'viewer';
}

/** Hub group name → hub key mapping (mirrors ShellGroupResolver). */
const HUB_GROUP_TO_KEY: Record<string, string> = {
  'DDRE-Sales': 'Sales',
  'DDRE-PropertyManagement': 'Property Mgmt',
  'DDRE-Office': 'Office',
};

/** Get human-readable list of hubs the simulated user can see. */
function getSimulatedVisibleHubLabels(groups: string[]): string {
  const hubs = ['Home', 'Library'];
  const groupNames = Object.keys(HUB_GROUP_TO_KEY);
  for (let i = 0; i < groupNames.length; i++) {
    if (groups.indexOf(groupNames[i]) !== -1) {
      hubs.push(HUB_GROUP_TO_KEY[groupNames[i]]);
    }
  }
  hubs.push('Help');
  return hubs.join(', ');
}
