import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import {
  Dropdown,
  IDropdownOption,
  TextField,
  DatePicker,
  Toggle,
  Stack,
  Label,
  MessageBar,
  MessageBarType,
} from '@fluentui/react';
import {
  TaskRecurrence,
  RecurrencePattern,
  DayOfWeek,
  WeekOfMonth,
} from '../../types';
import styles from './TaskRecurrenceEditor.module.scss';

/**
 * Props for the TaskRecurrenceEditor component
 */
export interface ITaskRecurrenceEditorProps {
  /**
   * Current recurrence pattern (undefined if no recurrence)
   */
  recurrence: TaskRecurrence | undefined;

  /**
   * Callback when recurrence changes
   */
  onChange: (recurrence: TaskRecurrence | undefined) => void;

  /**
   * Whether the editor is disabled
   */
  disabled?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Recurrence pattern options
 */
const patternOptions: IDropdownOption[] = [
  { key: 'daily', text: 'Daily' },
  { key: 'weekly', text: 'Weekly' },
  { key: 'fortnightly', text: 'Fortnightly' },
  { key: 'monthly', text: 'Monthly' },
  { key: 'yearly', text: 'Yearly' },
  { key: 'custom', text: 'Custom' },
];

/**
 * Days of the week for weekly recurrence
 */
const daysOfWeekOptions: { key: DayOfWeek; text: string; short: string }[] = [
  { key: 'sunday', text: 'Sunday', short: 'S' },
  { key: 'monday', text: 'Monday', short: 'M' },
  { key: 'tuesday', text: 'Tuesday', short: 'T' },
  { key: 'wednesday', text: 'Wednesday', short: 'W' },
  { key: 'thursday', text: 'Thursday', short: 'T' },
  { key: 'friday', text: 'Friday', short: 'F' },
  { key: 'saturday', text: 'Saturday', short: 'S' },
];

/**
 * Week of month options for monthly recurrence
 */
const weekOfMonthOptions: IDropdownOption[] = [
  { key: 'first', text: 'First' },
  { key: 'second', text: 'Second' },
  { key: 'third', text: 'Third' },
  { key: 'fourth', text: 'Fourth' },
  { key: 'last', text: 'Last' },
];

/**
 * Default recurrence pattern
 */
function createDefaultRecurrence(): TaskRecurrence {
  return {
    pattern: 'weekly',
    interval: 1,
    startDate: new Date().toISOString(),
    daysOfWeek: ['monday'],
  };
}

/**
 * Generate a human-readable summary of the recurrence pattern
 */
function getRecurrenceSummary(recurrence: TaskRecurrence): string {
  const { pattern, interval, daysOfWeek, dayOfMonth, weekOfMonth, endDate, occurrenceCount } =
    recurrence;

  let summary = '';

  // Pattern and interval
  const intervalNum = interval || 1;
  switch (pattern) {
    case 'daily':
      summary = intervalNum === 1 ? 'Every day' : `Every ${intervalNum} days`;
      break;
    case 'weekly':
      summary = intervalNum === 1 ? 'Every week' : `Every ${intervalNum} weeks`;
      break;
    case 'fortnightly':
      summary = 'Every 2 weeks';
      break;
    case 'monthly':
      summary = intervalNum === 1 ? 'Every month' : `Every ${intervalNum} months`;
      break;
    case 'yearly':
      summary = intervalNum === 1 ? 'Every year' : `Every ${intervalNum} years`;
      break;
    case 'custom':
      summary = 'Custom schedule';
      break;
  }

  // Days for weekly patterns
  if ((pattern === 'weekly' || pattern === 'fortnightly') && daysOfWeek && daysOfWeek.length > 0) {
    const dayNames = daysOfWeek.map((d) => d.charAt(0).toUpperCase() + d.slice(1));
    summary += ` on ${dayNames.join(', ')}`;
  }

  // Monthly details
  if (pattern === 'monthly') {
    if (weekOfMonth && daysOfWeek && daysOfWeek.length > 0) {
      summary += ` on the ${weekOfMonth} ${daysOfWeek[0]}`;
    } else if (dayOfMonth) {
      summary += ` on day ${dayOfMonth}`;
    }
  }

  // End condition
  if (occurrenceCount) {
    summary += `, ${occurrenceCount} times`;
  } else if (endDate) {
    const date = new Date(endDate);
    summary += `, until ${date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;
  }

  return summary;
}

/**
 * TaskRecurrenceEditor component
 *
 * Allows users to configure a recurrence pattern for a task.
 */
export const TaskRecurrenceEditor: React.FC<ITaskRecurrenceEditorProps> = ({
  recurrence,
  onChange,
  disabled = false,
  className,
}) => {
  const [isEnabled, setIsEnabled] = useState(recurrence !== undefined);
  const [localRecurrence, setLocalRecurrence] = useState<TaskRecurrence>(
    recurrence || createDefaultRecurrence()
  );
  const [endType, setEndType] = useState<'never' | 'count' | 'date'>(
    recurrence?.occurrenceCount ? 'count' : recurrence?.endDate ? 'date' : 'never'
  );

  // Sync local state with props
  useEffect(() => {
    if (recurrence) {
      setIsEnabled(true);
      setLocalRecurrence(recurrence);
      setEndType(recurrence.occurrenceCount ? 'count' : recurrence.endDate ? 'date' : 'never');
    } else {
      setIsEnabled(false);
    }
  }, [recurrence]);

  /**
   * Handle enable/disable toggle
   */
  const handleToggle = useCallback(
    (_: React.MouseEvent<HTMLElement>, checked?: boolean) => {
      setIsEnabled(!!checked);
      if (checked) {
        onChange(localRecurrence);
      } else {
        onChange(undefined);
      }
    },
    [localRecurrence, onChange]
  );

  /**
   * Update recurrence and notify parent
   */
  const updateRecurrence = useCallback(
    (updates: Partial<TaskRecurrence>) => {
      const updated = { ...localRecurrence, ...updates };
      setLocalRecurrence(updated);
      if (isEnabled) {
        onChange(updated);
      }
    },
    [localRecurrence, isEnabled, onChange]
  );

  /**
   * Handle pattern change
   */
  const handlePatternChange = useCallback(
    (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
      if (option) {
        const pattern = option.key as RecurrencePattern;
        const updates: Partial<TaskRecurrence> = { pattern };

        // Set sensible defaults for the new pattern
        if (
          (pattern === 'weekly' || pattern === 'fortnightly') &&
          (!localRecurrence.daysOfWeek || localRecurrence.daysOfWeek.length === 0)
        ) {
          updates.daysOfWeek = ['monday'];
        }
        if (pattern === 'monthly' && !localRecurrence.dayOfMonth) {
          updates.dayOfMonth = new Date().getDate();
        }

        updateRecurrence(updates);
      }
    },
    [localRecurrence, updateRecurrence]
  );

  /**
   * Handle interval change
   */
  const handleIntervalChange = useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      const interval = parseInt(newValue || '1', 10);
      if (!isNaN(interval) && interval >= 1 && interval <= 365) {
        updateRecurrence({ interval });
      }
    },
    [updateRecurrence]
  );

  /**
   * Handle day of week toggle
   */
  const handleDayToggle = useCallback(
    (day: DayOfWeek, checked: boolean) => {
      const currentDays = localRecurrence.daysOfWeek || [];
      let newDays: DayOfWeek[];

      if (checked) {
        newDays = [...currentDays, day];
      } else {
        newDays = currentDays.filter((d) => d !== day);
        // Ensure at least one day is selected
        if (newDays.length === 0) {
          return;
        }
      }

      updateRecurrence({ daysOfWeek: newDays });
    },
    [localRecurrence, updateRecurrence]
  );

  /**
   * Handle day of month change
   */
  const handleDayOfMonthChange = useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      const day = parseInt(newValue || '1', 10);
      if (!isNaN(day) && day >= 1 && day <= 31) {
        updateRecurrence({ dayOfMonth: day });
      }
    },
    [updateRecurrence]
  );

  /**
   * Handle week of month change
   */
  const handleWeekOfMonthChange = useCallback(
    (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
      if (option) {
        updateRecurrence({ weekOfMonth: option.key as WeekOfMonth });
      }
    },
    [updateRecurrence]
  );

  /**
   * Handle end type change
   */
  const handleEndTypeChange = useCallback(
    (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
      if (option) {
        const newEndType = option.key as 'never' | 'count' | 'date';
        setEndType(newEndType);

        switch (newEndType) {
          case 'never':
            updateRecurrence({ occurrenceCount: undefined, endDate: undefined });
            break;
          case 'count':
            updateRecurrence({ occurrenceCount: 10, endDate: undefined });
            break;
          case 'date': {
            // Default to 3 months from now
            const threeMonths = new Date();
            threeMonths.setMonth(threeMonths.getMonth() + 3);
            updateRecurrence({ occurrenceCount: undefined, endDate: threeMonths.toISOString() });
            break;
          }
        }
      }
    },
    [updateRecurrence]
  );

  /**
   * Handle occurrence count change
   */
  const handleOccurrenceCountChange = useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      const count = parseInt(newValue || '10', 10);
      if (!isNaN(count) && count >= 1 && count <= 999) {
        updateRecurrence({ occurrenceCount: count });
      }
    },
    [updateRecurrence]
  );

  /**
   * Handle end date change
   */
  const handleEndDateChange = useCallback(
    (date: Date | null | undefined) => {
      if (date) {
        updateRecurrence({ endDate: date.toISOString() });
      }
    },
    [updateRecurrence]
  );

  /**
   * Handle start date change
   */
  const handleStartDateChange = useCallback(
    (date: Date | null | undefined) => {
      if (date) {
        updateRecurrence({ startDate: date.toISOString() });
      }
    },
    [updateRecurrence]
  );

  const endTypeOptions: IDropdownOption[] = [
    { key: 'never', text: 'Never' },
    { key: 'count', text: 'After X occurrences' },
    { key: 'date', text: 'On a specific date' },
  ];

  return (
    <div className={`${styles.taskRecurrenceEditor} ${className || ''}`}>
      <Toggle
        label="Repeat task"
        checked={isEnabled}
        onChange={handleToggle}
        disabled={disabled}
        onText="Repeating"
        offText="One-time"
      />

      {isEnabled && (
        <div className={styles.recurrenceSettings}>
          {/* Summary */}
          <MessageBar messageBarType={MessageBarType.info} className={styles.summary}>
            {getRecurrenceSummary(localRecurrence)}
          </MessageBar>

          {/* Start date */}
          <DatePicker
            label="Start date"
            value={new Date(localRecurrence.startDate)}
            onSelectDate={handleStartDateChange}
            disabled={disabled}
            formatDate={(date) =>
              date?.toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }) || ''
            }
          />

          {/* Pattern and interval */}
          <Stack horizontal tokens={{ childrenGap: 16 }} className={styles.row}>
            <Stack.Item grow>
              <Dropdown
                label="Pattern"
                selectedKey={localRecurrence.pattern}
                options={patternOptions}
                onChange={handlePatternChange}
                disabled={disabled}
              />
            </Stack.Item>
            {localRecurrence.pattern !== 'fortnightly' && (
              <Stack.Item>
                <TextField
                  label="Every"
                  type="number"
                  min={1}
                  max={365}
                  value={String(localRecurrence.interval || 1)}
                  onChange={handleIntervalChange}
                  disabled={disabled}
                  suffix={
                    localRecurrence.pattern === 'daily'
                      ? 'day(s)'
                      : localRecurrence.pattern === 'weekly'
                      ? 'week(s)'
                      : localRecurrence.pattern === 'monthly'
                      ? 'month(s)'
                      : 'year(s)'
                  }
                  className={styles.intervalField}
                />
              </Stack.Item>
            )}
          </Stack>

          {/* Days of week for weekly/fortnightly */}
          {(localRecurrence.pattern === 'weekly' || localRecurrence.pattern === 'fortnightly') && (
            <div className={styles.daysOfWeek}>
              <Label>On days</Label>
              <Stack horizontal tokens={{ childrenGap: 4 }} className={styles.dayButtons}>
                {daysOfWeekOptions.map((day) => {
                  const isSelected =
                    localRecurrence.daysOfWeek !== undefined &&
                    localRecurrence.daysOfWeek.indexOf(day.key) !== -1;
                  return (
                    <div
                      key={day.key}
                      className={`${styles.dayButton} ${isSelected ? styles.selected : ''}`}
                      onClick={() => !disabled && handleDayToggle(day.key, !isSelected)}
                      title={day.text}
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-label={day.text}
                      tabIndex={disabled ? -1 : 0}
                    >
                      {day.short}
                    </div>
                  );
                })}
              </Stack>
            </div>
          )}

          {/* Monthly options */}
          {localRecurrence.pattern === 'monthly' && (
            <Stack horizontal tokens={{ childrenGap: 16 }} className={styles.row}>
              <Stack.Item>
                <TextField
                  label="On day of month"
                  type="number"
                  min={1}
                  max={31}
                  value={String(localRecurrence.dayOfMonth || 1)}
                  onChange={handleDayOfMonthChange}
                  disabled={disabled}
                  className={styles.dayOfMonthField}
                />
              </Stack.Item>
              <Stack.Item grow>
                <Dropdown
                  label="Or week of month"
                  placeholder="(optional)"
                  selectedKey={localRecurrence.weekOfMonth}
                  options={weekOfMonthOptions}
                  onChange={handleWeekOfMonthChange}
                  disabled={disabled}
                />
              </Stack.Item>
            </Stack>
          )}

          {/* End condition */}
          <Stack horizontal tokens={{ childrenGap: 16 }} className={styles.row}>
            <Stack.Item grow>
              <Dropdown
                label="Ends"
                selectedKey={endType}
                options={endTypeOptions}
                onChange={handleEndTypeChange}
                disabled={disabled}
              />
            </Stack.Item>

            {endType === 'count' && (
              <Stack.Item>
                <TextField
                  label="Occurrences"
                  type="number"
                  min={1}
                  max={999}
                  value={String(localRecurrence.occurrenceCount || 10)}
                  onChange={handleOccurrenceCountChange}
                  disabled={disabled}
                  className={styles.occurrenceField}
                />
              </Stack.Item>
            )}

            {endType === 'date' && (
              <Stack.Item grow>
                <DatePicker
                  label="End date"
                  value={localRecurrence.endDate ? new Date(localRecurrence.endDate) : undefined}
                  onSelectDate={handleEndDateChange}
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
              </Stack.Item>
            )}
          </Stack>
        </div>
      )}
    </div>
  );
};

export default TaskRecurrenceEditor;
