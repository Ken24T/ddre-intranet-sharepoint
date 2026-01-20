import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  TagPicker,
  ITag,
  IBasePickerSuggestionsProps,
  Label,
  Persona,
  PersonaSize,
  IconButton,
  Stack,
  Text,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Dropdown,
  IDropdownOption,
} from '@fluentui/react';
import { TaskAssignment, TaskRole } from '../../types';
import styles from './TaskAssignmentPicker.module.scss';

/**
 * User search result (before assignment role is set)
 */
export interface UserSearchResult {
  userId: string;
  userDisplayName: string;
  userEmail?: string;
}

/**
 * Props for the TaskAssignmentPicker component
 */
export interface ITaskAssignmentPickerProps {
  /**
   * Currently selected assignments
   */
  assignments: TaskAssignment[];

  /**
   * Callback when assignments change
   */
  onChange: (assignments: TaskAssignment[]) => void;

  /**
   * Label for the picker
   */
  label?: string;

  /**
   * Maximum number of assignments allowed
   * @default undefined (unlimited)
   */
  maxAssignments?: number;

  /**
   * Whether the picker is disabled
   */
  disabled?: boolean;

  /**
   * Callback to search for users
   * Returns a promise with matching users
   */
  onSearchUsers?: (query: string) => Promise<UserSearchResult[]>;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Picker suggestion props configuration
 */
const suggestionProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: 'Suggested people',
  noResultsFoundText: 'No people found',
  loadingText: 'Searching...',
  showRemoveButtons: false,
  suggestionsAvailableAlertText: 'Suggestions available',
  resultsMaximumNumber: 10,
};

/**
 * Role options for assignments
 */
const roleOptions: IDropdownOption[] = [
  { key: 'owner', text: 'Owner' },
  { key: 'assignee', text: 'Assignee' },
  { key: 'viewer', text: 'Viewer' },
];

/**
 * Convert a TaskAssignment to a TagPicker ITag
 */
function assignmentToTag(assignment: TaskAssignment): ITag {
  return {
    key: assignment.userId,
    name: assignment.userDisplayName || assignment.userId,
  };
}

/**
 * Mock user data for development/testing
 */
const mockUsers: UserSearchResult[] = [
  {
    userId: 'user-1',
    userDisplayName: 'John Smith',
    userEmail: 'john.smith@example.com',
  },
  {
    userId: 'user-2',
    userDisplayName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@example.com',
  },
  {
    userId: 'user-3',
    userDisplayName: 'Mike Williams',
    userEmail: 'mike.williams@example.com',
  },
  {
    userId: 'user-4',
    userDisplayName: 'Emily Brown',
    userEmail: 'emily.brown@example.com',
  },
  {
    userId: 'user-5',
    userDisplayName: 'David Lee',
    userEmail: 'david.lee@example.com',
  },
];

/**
 * Default user search function (mock implementation)
 */
async function defaultSearchUsers(query: string): Promise<UserSearchResult[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!query) {
    return mockUsers.slice(0, 5);
  }

  const lowerQuery = query.toLowerCase();
  return mockUsers.filter(
    (user) =>
      user.userDisplayName.toLowerCase().includes(lowerQuery) ||
      (user.userEmail && user.userEmail.toLowerCase().includes(lowerQuery))
  );
}

/**
 * TaskAssignmentPicker component
 *
 * Allows users to search for and select people to assign to a task.
 * Supports multiple assignments with a configurable maximum.
 */
export const TaskAssignmentPicker: React.FC<ITaskAssignmentPickerProps> = ({
  assignments,
  onChange,
  label = 'Assigned to',
  maxAssignments,
  disabled = false,
  onSearchUsers = defaultSearchUsers,
  className,
}) => {
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>(undefined);

  // Convert current assignments to tags
  const selectedTags = assignments.map(assignmentToTag);

  /**
   * Filter suggestions to exclude already selected users
   */
  const filterSuggestions = useCallback(
    (filterText: string, selectedItems?: ITag[]): Promise<ITag[]> => {
      setSearchError(undefined);
      setIsSearching(true);

      return onSearchUsers(filterText)
        .then((users) => {
          setSearchResults(users);
          setIsSearching(false);

          // Filter out already selected users
          const selectedIds = new Set(selectedItems?.map((item) => item.key) || []);
          return users
            .filter((user) => !selectedIds.has(user.userId))
            .map((user) => ({
              key: user.userId,
              name: user.userDisplayName,
            }));
        })
        .catch((error) => {
          setSearchError(error instanceof Error ? error.message : 'Failed to search users');
          setIsSearching(false);
          return [];
        });
    },
    [onSearchUsers]
  );

  /**
   * Handle tag selection changes
   */
  const handleChange = useCallback(
    (items?: ITag[]) => {
      if (!items) {
        onChange([]);
        return;
      }

      // Build new assignments list, preserving existing assignment data
      const newAssignments: TaskAssignment[] = items.map((tag) => {
        // Check if this user is already assigned (preserve their data)
        const existing = assignments.find((a) => a.userId === tag.key);
        if (existing) {
          return existing;
        }

        // Find user details from search results
        const searchResult = searchResults.find((u) => u.userId === tag.key);

        // Create new assignment with default role
        return {
          userId: tag.key as string,
          userDisplayName: searchResult?.userDisplayName || tag.name,
          userEmail: searchResult?.userEmail,
          role: 'assignee' as TaskRole,
          assignedAt: new Date().toISOString(),
        };
      });

      onChange(newAssignments);
    },
    [onChange, assignments, searchResults]
  );

  /**
   * Remove a specific assignment
   */
  const handleRemoveAssignment = useCallback(
    (userId: string) => {
      onChange(assignments.filter((a) => a.userId !== userId));
    },
    [onChange, assignments]
  );

  /**
   * Update the role for an assignment
   */
  const handleRoleChange = useCallback(
    (userId: string, role: TaskRole) => {
      onChange(
        assignments.map((a) => (a.userId === userId ? { ...a, role } : a))
      );
    },
    [onChange, assignments]
  );

  /**
   * Render a suggestion item
   */
  const renderSuggestionItem = useCallback(
    (props: ITag): JSX.Element => {
      const user = searchResults.find((u) => u.userId === props.key);
      return (
        <div className={styles.suggestionItem}>
          <Persona
            text={props.name}
            secondaryText={user?.userEmail}
            size={PersonaSize.size32}
            showSecondaryText
          />
        </div>
      );
    },
    [searchResults]
  );

  /**
   * Check if we've reached the maximum assignments
   */
  const isMaxReached = maxAssignments !== undefined && assignments.length >= maxAssignments;

  return (
    <div className={`${styles.taskAssignmentPicker} ${className || ''}`}>
      {label && <Label disabled={disabled}>{label}</Label>}

      {searchError && (
        <MessageBar
          messageBarType={MessageBarType.error}
          onDismiss={() => setSearchError(undefined)}
          dismissButtonAriaLabel="Close"
        >
          {searchError}
        </MessageBar>
      )}

      {!isMaxReached && (
        <TagPicker
          selectedItems={selectedTags}
          onResolveSuggestions={filterSuggestions}
          onChange={handleChange}
          onRenderSuggestionsItem={renderSuggestionItem}
          pickerSuggestionsProps={suggestionProps}
          disabled={disabled}
          inputProps={{
            placeholder: disabled ? '' : 'Search for people...',
            'aria-label': 'Search for people to assign',
          }}
          resolveDelay={200}
          className={styles.picker}
        />
      )}

      {isMaxReached && (
        <Text variant="small" className={styles.maxReached}>
          Maximum of {maxAssignments} assignee{maxAssignments !== 1 ? 's' : ''} reached
        </Text>
      )}

      {isSearching && (
        <div className={styles.searching}>
          <Spinner size={SpinnerSize.small} label="Searching..." />
        </div>
      )}

      {/* Display selected assignments as personas with role selection */}
      {assignments.length > 0 && (
        <Stack className={styles.assignmentList} tokens={{ childrenGap: 8 }}>
          {assignments.map((assignment) => (
            <div key={assignment.userId} className={styles.assignmentItem}>
              <Persona
                text={assignment.userDisplayName || assignment.userId}
                secondaryText={assignment.userEmail}
                size={PersonaSize.size32}
                showSecondaryText={!!assignment.userEmail}
              />
              <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
                <Dropdown
                  selectedKey={assignment.role}
                  options={roleOptions}
                  onChange={(_, option) =>
                    option && handleRoleChange(assignment.userId, option.key as TaskRole)
                  }
                  disabled={disabled}
                  className={styles.roleDropdown}
                  ariaLabel={`Role for ${assignment.userDisplayName || assignment.userId}`}
                />
                {!disabled && (
                  <IconButton
                    iconProps={{ iconName: 'Cancel' }}
                    title="Remove assignee"
                    ariaLabel={`Remove ${assignment.userDisplayName || assignment.userId}`}
                    onClick={() => handleRemoveAssignment(assignment.userId)}
                    className={styles.removeButton}
                  />
                )}
              </Stack>
            </div>
          ))}
        </Stack>
      )}

      {assignments.length === 0 && !isSearching && (
        <Text variant="small" className={styles.noAssignments}>
          No one assigned yet
        </Text>
      )}
    </div>
  );
};

export default TaskAssignmentPicker;
