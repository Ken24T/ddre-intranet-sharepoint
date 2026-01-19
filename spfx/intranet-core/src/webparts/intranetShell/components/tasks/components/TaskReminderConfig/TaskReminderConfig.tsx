import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  Stack,
  Label,
  Dropdown,
  IDropdownOption,
  TextField,
  DatePicker,
  IconButton,
  Text,
  MessageBar,
  MessageBarType,
  DefaultButton,
  Checkbox,
} from '@fluentui/react';
import { TaskReminder, ReminderTiming, ReminderChannel } from '../../types';
import styles from './TaskReminderConfig.module.scss';

/**
 * Props for the TaskReminderConfig component
 */
export interface ITaskReminderConfigProps {
  /**
   * Current reminders
   */
  reminders: TaskReminder[];

  /**
   * Callback when reminders change
   */
  onChange: (reminders: TaskReminder[]) => void;

  /**
   * Task due date (for relative reminders)
   */
  dueDate?: string;

  /**
   * Maximum number of reminders allowed
   * @default 5
   */
  maxReminders?: number;

  /**
   * Whether the config is disabled
   */
  disabled?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Reminder timing options
 */
const timingOptions: IDropdownOption[] = [
  { key: 'before-due', text: 'Before due date' },
  { key: 'on-due', text: 'On due date' },
  { key: 'custom', text: 'At specific time' },
];

/**
 * Quick reminder presets (offset in minutes)
 */
const reminderPresets: { label: string; offsetMinutes: number }[] = [
  { label: '15 min before', offsetMinutes: 15 },
  { label: '1 hour before', offsetMinutes: 60 },
  { label: '1 day before', offsetMinutes: 1440 },
  { label: '1 week before', offsetMinutes: 10080 },
];

/**
 * Generate a unique ID for a reminder
 */
function generateReminderId(): string {
  return `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a default reminder
 */
function createDefaultReminder(): TaskReminder {
  return {
    id: generateReminderId(),
    timing: 'before-due',
    offsetMinutes: 1440, // 1 day
    channels: ['intranet'],
  };
}

/**
 * Format offset minutes to readable string
 */
function formatOffsetMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes < 10080) {
    const days = Math.floor(minutes / 1440);
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else {
    const weeks = Math.floor(minutes / 10080);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
}

/**
 * Format a reminder for display
 */
function formatReminder(reminder: TaskReminder): string {
  if (reminder.timing === 'before-due') {
    return `${formatOffsetMinutes(reminder.offsetMinutes || 0)} before due`;
  } else if (reminder.timing === 'on-due') {
    return 'On due date';
  } else if (reminder.timing === 'custom' && reminder.customDateTime) {
    const date = new Date(reminder.customDateTime);
    return date.toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return 'At specific time';
}

/**
 * TaskReminderConfig component
 *
 * Allows users to configure reminders for a task.
 */
export const TaskReminderConfig: React.FC<ITaskReminderConfigProps> = ({
  reminders,
  onChange,
  dueDate,
  maxReminders = 5,
  disabled = false,
  className,
}) => {
  const [expandedReminderId, setExpandedReminderId] = useState<string | undefined>(undefined);

  /**
   * Add a new reminder
   */
  const handleAddReminder = useCallback(() => {
    if (reminders.length >= maxReminders) {
      return;
    }
    const newReminder = createDefaultReminder();
    onChange([...reminders, newReminder]);
    setExpandedReminderId(newReminder.id);
  }, [reminders, maxReminders, onChange]);

  /**
   * Add a preset reminder
   */
  const handleAddPreset = useCallback(
    (preset: (typeof reminderPresets)[0]) => {
      if (reminders.length >= maxReminders) {
        return;
      }
      const newReminder: TaskReminder = {
        id: generateReminderId(),
        timing: 'before-due',
        offsetMinutes: preset.offsetMinutes,
        channels: ['intranet'],
      };
      onChange([...reminders, newReminder]);
    },
    [reminders, maxReminders, onChange]
  );

  /**
   * Update a specific reminder
   */
  const updateReminder = useCallback(
    (reminderId: string, updates: Partial<TaskReminder>) => {
      onChange(reminders.map((r) => (r.id === reminderId ? { ...r, ...updates } : r)));
    },
    [reminders, onChange]
  );

  /**
   * Remove a reminder
   */
  const handleRemoveReminder = useCallback(
    (reminderId: string) => {
      onChange(reminders.filter((r) => r.id !== reminderId));
      if (expandedReminderId === reminderId) {
        setExpandedReminderId(undefined);
      }
    },
    [reminders, onChange, expandedReminderId]
  );

  /**
   * Toggle channel for a reminder
   */
  const handleToggleChannel = useCallback(
    (reminderId: string, channel: ReminderChannel, checked: boolean) => {
      const reminder = reminders.find((r) => r.id === reminderId);
      if (!reminder) return;

      let newChannels: ReminderChannel[];
      if (checked) {
        newChannels = [...reminder.channels, channel];
      } else {
        newChannels = reminder.channels.filter((c) => c !== channel);
        // Ensure at least one channel is selected
        if (newChannels.length === 0) {
          return;
        }
      }
      updateReminder(reminderId, { channels: newChannels });
    },
    [reminders, updateReminder]
  );

  /**
   * Toggle expanded state of a reminder
   */
  const toggleExpanded = useCallback((reminderId: string) => {
    setExpandedReminderId((current) => (current === reminderId ? undefined : reminderId));
  }, []);

  const canAddMore = reminders.length < maxReminders;

  return (
    <div className={`${styles.taskReminderConfig} ${className || ''}`}>
      <Label>Reminders</Label>

      {/* Quick presets */}
      {canAddMore && !disabled && (
        <div className={styles.presets}>
          <Text variant="small" className={styles.presetsLabel}>
            Quick add:
          </Text>
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            {reminderPresets.map((preset) => (
              <DefaultButton
                key={preset.offsetMinutes}
                text={preset.label}
                onClick={() => handleAddPreset(preset)}
                disabled={disabled}
                className={styles.presetButton}
              />
            ))}
          </Stack>
        </div>
      )}

      {/* Reminder list */}
      {reminders.length > 0 ? (
        <Stack className={styles.reminderList} tokens={{ childrenGap: 8 }}>
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`${styles.reminderItem} ${reminder.sent ? styles.sent : ''}`}
            >
              <div className={styles.reminderHeader}>
                <Text
                  className={styles.reminderSummary}
                  onClick={() => !disabled && toggleExpanded(reminder.id)}
                >
                  {formatReminder(reminder)}
                </Text>
                <Stack horizontal tokens={{ childrenGap: 4 }}>
                  {reminder.sent && (
                    <Text variant="small" className={styles.sentLabel}>
                      Sent
                    </Text>
                  )}
                  <IconButton
                    iconProps={{
                      iconName: expandedReminderId === reminder.id ? 'ChevronUp' : 'ChevronDown',
                    }}
                    title="Expand/collapse"
                    ariaLabel="Expand or collapse reminder settings"
                    onClick={() => toggleExpanded(reminder.id)}
                    disabled={disabled}
                  />
                  <IconButton
                    iconProps={{ iconName: 'Delete' }}
                    title="Remove reminder"
                    ariaLabel="Remove reminder"
                    onClick={() => handleRemoveReminder(reminder.id)}
                    disabled={disabled}
                    className={styles.deleteButton}
                  />
                </Stack>
              </div>

              {/* Expanded settings */}
              {expandedReminderId === reminder.id && (
                <div className={styles.reminderSettings}>
                  <Dropdown
                    label="Reminder timing"
                    selectedKey={reminder.timing}
                    options={timingOptions}
                    onChange={(_, option) =>
                      option &&
                      updateReminder(reminder.id, { timing: option.key as ReminderTiming })
                    }
                    disabled={disabled}
                  />

                  {reminder.timing === 'before-due' && (
                    <TextField
                      label="Minutes before due"
                      type="number"
                      min={1}
                      max={525600}
                      value={String(reminder.offsetMinutes || 1440)}
                      onChange={(_, value) =>
                        updateReminder(reminder.id, {
                          offsetMinutes: parseInt(value || '1440', 10),
                        })
                      }
                      disabled={disabled}
                      description={formatOffsetMinutes(reminder.offsetMinutes || 1440)}
                    />
                  )}

                  {reminder.timing === 'custom' && (
                    <DatePicker
                      label="Remind at"
                      value={
                        reminder.customDateTime ? new Date(reminder.customDateTime) : undefined
                      }
                      onSelectDate={(date) =>
                        date &&
                        updateReminder(reminder.id, { customDateTime: date.toISOString() })
                      }
                      disabled={disabled}
                      minDate={new Date()}
                      formatDate={(date) =>
                        date?.toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }) || ''
                      }
                    />
                  )}

                  <div className={styles.channelsSection}>
                    <Label>Notification channels</Label>
                    <Stack horizontal tokens={{ childrenGap: 16 }}>
                      <Checkbox
                        label="Intranet"
                        checked={reminder.channels.indexOf('intranet') !== -1}
                        onChange={(_, checked) =>
                          handleToggleChannel(reminder.id, 'intranet', !!checked)
                        }
                        disabled={disabled}
                      />
                      <Checkbox
                        label="Email"
                        checked={reminder.channels.indexOf('email') !== -1}
                        onChange={(_, checked) =>
                          handleToggleChannel(reminder.id, 'email', !!checked)
                        }
                        disabled={disabled}
                      />
                      <Checkbox
                        label="Teams"
                        checked={reminder.channels.indexOf('teams') !== -1}
                        onChange={(_, checked) =>
                          handleToggleChannel(reminder.id, 'teams', !!checked)
                        }
                        disabled={disabled}
                      />
                    </Stack>
                  </div>

                  {!dueDate && reminder.timing === 'before-due' && (
                    <MessageBar messageBarType={MessageBarType.warning}>
                      Set a due date for relative reminders to work
                    </MessageBar>
                  )}
                </div>
              )}
            </div>
          ))}
        </Stack>
      ) : (
        <Text variant="small" className={styles.noReminders}>
          No reminders set
        </Text>
      )}

      {/* Add custom reminder button */}
      {canAddMore && !disabled && (
        <DefaultButton
          iconProps={{ iconName: 'Add' }}
          text="Add custom reminder"
          onClick={handleAddReminder}
          disabled={disabled}
          className={styles.addButton}
        />
      )}

      {!canAddMore && (
        <Text variant="small" className={styles.maxReached}>
          Maximum of {maxReminders} reminders reached
        </Text>
      )}
    </div>
  );
};

export default TaskReminderConfig;
