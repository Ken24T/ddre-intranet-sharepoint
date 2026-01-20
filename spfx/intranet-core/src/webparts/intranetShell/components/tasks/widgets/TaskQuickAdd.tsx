/**
 * TaskQuickAdd Component
 *
 * Quick task creation from any hub context.
 * Provides minimal input for rapid task creation with auto-linking.
 */

import * as React from 'react';
import {
  Stack,
  TextField,
  PrimaryButton,
  DefaultButton,
  Dropdown,
  IDropdownOption,
  Callout,
  DirectionalHint,
  IconButton,
  Text,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
} from '@fluentui/react';
import { useId } from '@fluentui/react-hooks';
import type {
  TaskPriority,
  TaskHubLink,
  CreateTaskRequest,
  TaskOwnership,
} from '../types';
import styles from './TaskQuickAdd.module.scss';

export interface ITaskQuickAddProps {
  /** Whether the quick add callout is visible */
  isOpen: boolean;
  /** Target element for the callout */
  target: React.RefObject<HTMLElement>;
  /** Callback to close the quick add */
  onDismiss: () => void;
  /** Callback when task is created */
  onCreateTask: (request: CreateTaskRequest) => Promise<void>;
  /** Current hub context to auto-link (optional) */
  hubContext?: TaskHubLink;
  /** Default ownership for tasks */
  defaultOwnership: TaskOwnership;
  /** Optional placeholder text */
  placeholder?: string;
  /** Whether creation is in progress */
  isCreating?: boolean;
  /** Error message if creation failed */
  error?: string | undefined;
}

const priorityOptions: IDropdownOption[] = [
  { key: 'low', text: 'Low' },
  { key: 'medium', text: 'Medium' },
  { key: 'high', text: 'High' },
  { key: 'urgent', text: 'Urgent' },
];

/**
 * Quick task creation callout with minimal input
 */
export const TaskQuickAdd: React.FC<ITaskQuickAddProps> = ({
  isOpen,
  target,
  onDismiss,
  onCreateTask,
  hubContext,
  defaultOwnership,
  placeholder = 'Enter task title...',
  isCreating = false,
  error,
}) => {
  const [title, setTitle] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const [showPriorityPicker, setShowPriorityPicker] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | undefined>(
    undefined
  );

  const calloutId = useId('task-quick-add');
  const titleInputRef = React.useRef<HTMLInputElement | undefined>(undefined);

  // Reset state when callout opens
  React.useEffect(() => {
    if (isOpen) {
      setTitle('');
      setPriority('medium');
      setShowPriorityPicker(false);
      setLocalError(undefined);
      // Focus input after a brief delay for callout animation
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault();

    if (!title.trim()) {
      setLocalError('Please enter a task title');
      return;
    }

    setLocalError(undefined);

    const request: CreateTaskRequest = {
      title: title.trim(),
      priority,
      ownership: defaultOwnership,
      hubLink: hubContext,
    };

    try {
      await onCreateTask(request);
      onDismiss();
    } catch {
      // Error handled by parent via error prop
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit().catch(() => {
        // Error handled by parent via error prop
      });
    } else if (e.key === 'Escape') {
      onDismiss();
    }
  };

  const handleClick = (): void => {
    handleSubmit().catch(() => {
      // Error handled by parent via error prop
    });
  };

  const displayError = error ?? localError;

  if (!isOpen) return null;

  return (
    <Callout
      target={target.current}
      onDismiss={onDismiss}
      directionalHint={DirectionalHint.bottomLeftEdge}
      gapSpace={8}
      isBeakVisible={true}
      className={styles.callout}
      role="dialog"
      aria-labelledby={calloutId}
    >
      <Stack className={styles.container} tokens={{ childrenGap: 12 }}>
        <Stack horizontal verticalAlign="center" className={styles.header}>
          <Text id={calloutId} variant="mediumPlus" className={styles.title}>
            Quick Add Task
          </Text>
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            ariaLabel="Close"
            onClick={onDismiss}
            className={styles.closeButton}
          />
        </Stack>

        {hubContext && (
          <div className={styles.hubContext}>
            <Text variant="small" className={styles.hubLabel}>
              <span className={styles.hubIcon}>🔗</span>
              Linked to: {hubContext.hubDisplayName}
            </Text>
          </div>
        )}

        {displayError && (
          <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
            {displayError}
          </MessageBar>
        )}

        <form onSubmit={handleSubmit}>
          <Stack tokens={{ childrenGap: 12 }}>
            <TextField
              placeholder={placeholder}
              value={title}
              onChange={(_, newValue) => setTitle(newValue ?? '')}
              onKeyDown={handleKeyDown}
              disabled={isCreating}
              componentRef={(ref) => {
                if (ref) {
                  titleInputRef.current =
                    ref as unknown as HTMLInputElement;
                }
              }}
              autoComplete="off"
            />

            {showPriorityPicker && (
              <Dropdown
                label="Priority"
                selectedKey={priority}
                options={priorityOptions}
                onChange={(_, option) =>
                  option && setPriority(option.key as TaskPriority)
                }
                disabled={isCreating}
              />
            )}

            <Stack horizontal tokens={{ childrenGap: 8 }}>
              {!showPriorityPicker && (
                <DefaultButton
                  iconProps={{ iconName: 'Flag' }}
                  text="Priority"
                  onClick={() => setShowPriorityPicker(true)}
                  disabled={isCreating}
                  className={styles.optionButton}
                />
              )}

              <Stack
                horizontal
                tokens={{ childrenGap: 8 }}
                className={styles.actions}
              >
                <DefaultButton
                  text="Cancel"
                  onClick={onDismiss}
                  disabled={isCreating}
                />
                <PrimaryButton
                  text={isCreating ? 'Creating...' : 'Create'}
                  onClick={handleClick}
                  disabled={isCreating || !title.trim()}
                >
                  {isCreating && (
                    <Spinner
                      size={SpinnerSize.xSmall}
                      className={styles.spinner}
                    />
                  )}
                </PrimaryButton>
              </Stack>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Callout>
  );
};

export default TaskQuickAdd;
