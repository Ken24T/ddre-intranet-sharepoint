/**
 * TaskEditor - Create/edit form for tasks with validation.
 */
import * as React from 'react';
import {
  Panel,
  PanelType,
  TextField,
  Dropdown,
  IDropdownOption,
  DatePicker,
  PrimaryButton,
  DefaultButton,
  MessageBar,
  MessageBarType,
  Label,
  IconButton,
  Spinner,
  SpinnerSize,
} from '@fluentui/react';
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskChecklist,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskOwnership,
  TaskHubLink,
} from '../../types';
import styles from './TaskEditor.module.scss';

export interface ITaskEditorProps {
  /** Task to edit (undefined for create mode) */
  task?: Task;
  /** Whether the editor is open */
  isOpen: boolean;
  /** Called when the editor is dismissed */
  onDismiss: () => void;
  /** Called when save is requested */
  onSave: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
  /** Default ownership for new tasks */
  defaultOwnership?: TaskOwnership;
  /** Default hub link for new tasks */
  defaultHubLink?: TaskHubLink;
  /** Available hubs for linking */
  availableHubs?: Array<{ key: string; text: string }>;
  /** Loading state */
  loading?: boolean;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | undefined;
  hubId: string;
  checklist: TaskChecklist[];
  newChecklistItem: string;
}

interface FormErrors {
  title?: string;
  general?: string;
}

const statusOptions: IDropdownOption[] = [
  { key: 'not-started', text: 'Not started' },
  { key: 'in-progress', text: 'In progress' },
  { key: 'completed', text: 'Completed' },
  { key: 'cancelled', text: 'Cancelled' },
];

const priorityOptions: IDropdownOption[] = [
  { key: 'low', text: 'Low' },
  { key: 'medium', text: 'Medium' },
  { key: 'high', text: 'High' },
  { key: 'urgent', text: 'Urgent' },
];

/** Generate a simple unique ID */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const TaskEditor: React.FC<ITaskEditorProps> = ({
  task,
  isOpen,
  onDismiss,
  onSave,
  defaultOwnership,
  defaultHubLink,
  availableHubs = [],
  loading = false,
}) => {
  const isEditMode = !!task;

  // Form state
  const [form, setForm] = React.useState<FormState>({
    title: '',
    description: '',
    status: 'not-started',
    priority: 'medium',
    dueDate: undefined,
    hubId: '',
    checklist: [],
    newChecklistItem: '',
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [saving, setSaving] = React.useState(false);

  // Reset form when task changes or panel opens
  React.useEffect(() => {
    if (isOpen) {
      if (task) {
        setForm({
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          hubId: task.hubLink?.hubId ?? '',
          checklist: task.checklist ?? [],
          newChecklistItem: '',
        });
      } else {
        setForm({
          title: '',
          description: '',
          status: 'not-started',
          priority: 'medium',
          dueDate: undefined,
          hubId: defaultHubLink?.hubId ?? '',
          checklist: [],
          newChecklistItem: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, task, defaultHubLink]);

  // Form field handlers
  const handleTitleChange = React.useCallback(
    (_: React.FormEvent, value?: string) => {
      setForm((prev) => ({ ...prev, title: value ?? '' }));
      if (errors.title) {
        setErrors((prev) => ({ ...prev, title: undefined }));
      }
    },
    [errors.title]
  );

  const handleDescriptionChange = React.useCallback(
    (_: React.FormEvent, value?: string) => {
      setForm((prev) => ({ ...prev, description: value ?? '' }));
    },
    []
  );

  const handleStatusChange = React.useCallback(
    (_: React.FormEvent, option?: IDropdownOption) => {
      if (option) {
        setForm((prev) => ({ ...prev, status: option.key as TaskStatus }));
      }
    },
    []
  );

  const handlePriorityChange = React.useCallback(
    (_: React.FormEvent, option?: IDropdownOption) => {
      if (option) {
        setForm((prev) => ({ ...prev, priority: option.key as TaskPriority }));
      }
    },
    []
  );

  const handleDueDateChange = React.useCallback((date: Date | null | undefined) => {
    setForm((prev) => ({ ...prev, dueDate: date ?? undefined }));
  }, []);

  const handleHubChange = React.useCallback(
    (_: React.FormEvent, option?: IDropdownOption) => {
      if (option) {
        setForm((prev) => ({ ...prev, hubId: option.key as string }));
      }
    },
    []
  );

  // Checklist handlers
  const handleNewChecklistItemChange = React.useCallback(
    (_: React.FormEvent, value?: string) => {
      setForm((prev) => ({ ...prev, newChecklistItem: value ?? '' }));
    },
    []
  );

  const handleAddChecklistItem = React.useCallback(() => {
    if (form.newChecklistItem.trim()) {
      const newItem: TaskChecklist = {
        id: generateId(),
        title: form.newChecklistItem.trim(),
        completed: false,
        sortOrder: form.checklist.length,
      };
      setForm((prev) => ({
        ...prev,
        checklist: [...prev.checklist, newItem],
        newChecklistItem: '',
      }));
    }
  }, [form.newChecklistItem, form.checklist.length]);

  const handleChecklistKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddChecklistItem();
      }
    },
    [handleAddChecklistItem]
  );

  const handleRemoveChecklistItem = React.useCallback((itemId: string) => {
    setForm((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== itemId),
    }));
  }, []);

  const handleToggleChecklistItem = React.useCallback((itemId: string) => {
    setForm((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }));
  }, []);

  // Validation
  const validate = React.useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (form.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or fewer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form.title]);

  // Save handler
  const handleSave = React.useCallback(async () => {
    if (!validate()) return;

    setSaving(true);
    setErrors({});

    try {
      const hubLink: TaskHubLink | undefined = form.hubId
        ? {
            hubId: form.hubId,
            hubDisplayName: availableHubs.find((h) => h.key === form.hubId)?.text,
          }
        : undefined;

      if (isEditMode && task) {
        // Update existing task
        const updateData: UpdateTaskRequest = {
          title: form.title,
          description: form.description || undefined,
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate?.toISOString(),
        };
        await onSave(updateData);
      } else {
        // Create new task
        const ownership = defaultOwnership ?? {
          type: 'user' as const,
          ownerId: 'current-user', // This would be replaced with actual user ID
        };

        const createData: CreateTaskRequest = {
          title: form.title,
          description: form.description || undefined,
          priority: form.priority,
          ownership,
          hubLink,
          dueDate: form.dueDate?.toISOString(),
          checklist: form.checklist.map((item) => ({ title: item.title })),
        };
        await onSave(createData);
      }

      onDismiss();
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'Failed to save task',
      });
    } finally {
      setSaving(false);
    }
  }, [
    validate,
    form,
    isEditMode,
    task,
    defaultOwnership,
    availableHubs,
    onSave,
    onDismiss,
  ]);

  const hubOptions: IDropdownOption[] = React.useMemo(
    () => [
      { key: '', text: 'No hub' },
      ...availableHubs,
    ],
    [availableHubs]
  );

  const onRenderFooter = (): JSX.Element => (
    <div className={styles.footer}>
      <DefaultButton onClick={onDismiss} disabled={saving}>
        Cancel
      </DefaultButton>
      <PrimaryButton onClick={handleSave} disabled={saving || loading}>
        {saving ? <Spinner size={SpinnerSize.xSmall} /> : isEditMode ? 'Save' : 'Create'}
      </PrimaryButton>
    </div>
  );

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.medium}
      headerText={isEditMode ? 'Edit Task' : 'New Task'}
      onRenderFooterContent={onRenderFooter}
      isFooterAtBottom
      closeButtonAriaLabel="Close"
      className={styles.panel}
    >
      {loading && (
        <div className={styles.loading}>
          <Spinner size={SpinnerSize.large} label="Loading..." />
        </div>
      )}

      {!loading && (
        <div className={styles.form}>
          {errors.general && (
            <MessageBar
              messageBarType={MessageBarType.error}
              className={styles.errorBar}
              onDismiss={() => setErrors((prev) => ({ ...prev, general: undefined }))}
            >
              {errors.general}
            </MessageBar>
          )}

          {/* Title */}
          <TextField
            label="Title"
            required
            value={form.title}
            onChange={handleTitleChange}
            errorMessage={errors.title}
            placeholder="Enter task title"
            maxLength={200}
            disabled={saving}
          />

          {/* Description */}
          <TextField
            label="Description"
            multiline
            rows={4}
            value={form.description}
            onChange={handleDescriptionChange}
            placeholder="Add more details (optional)"
            disabled={saving}
          />

          {/* Status and Priority row */}
          <div className={styles.row}>
            {isEditMode && (
              <Dropdown
                label="Status"
                options={statusOptions}
                selectedKey={form.status}
                onChange={handleStatusChange}
                disabled={saving}
                className={styles.halfWidth}
              />
            )}
            <Dropdown
              label="Priority"
              options={priorityOptions}
              selectedKey={form.priority}
              onChange={handlePriorityChange}
              disabled={saving}
              className={isEditMode ? styles.halfWidth : styles.fullWidth}
            />
          </div>

          {/* Due Date */}
          <DatePicker
            label="Due date"
            value={form.dueDate}
            onSelectDate={handleDueDateChange}
            placeholder="Select due date (optional)"
            disabled={saving}
            minDate={new Date()}
            allowTextInput
          />

          {/* Hub Link */}
          {hubOptions.length > 1 && (
            <Dropdown
              label="Link to hub"
              options={hubOptions}
              selectedKey={form.hubId}
              onChange={handleHubChange}
              disabled={saving}
              placeholder="Select hub (optional)"
            />
          )}

          {/* Checklist */}
          <div className={styles.checklistSection}>
            <Label>Checklist</Label>
            
            {form.checklist.length > 0 && (
              <div className={styles.checklistItems}>
                {form.checklist.map((item) => (
                  <div key={item.id} className={styles.checklistItem}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      disabled={saving}
                      className={styles.checklistCheckbox}
                    />
                    <span
                      className={`${styles.checklistText} ${item.completed ? styles.completed : ''}`}
                    >
                      {item.title}
                    </span>
                    <IconButton
                      iconProps={{ iconName: 'Cancel' }}
                      title="Remove item"
                      ariaLabel="Remove checklist item"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      disabled={saving}
                      className={styles.removeButton}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className={styles.addChecklistItem}>
              <TextField
                placeholder="Add checklist item"
                value={form.newChecklistItem}
                onChange={handleNewChecklistItemChange}
                onKeyDown={handleChecklistKeyDown}
                disabled={saving}
                className={styles.checklistInput}
              />
              <IconButton
                iconProps={{ iconName: 'Add' }}
                title="Add item"
                ariaLabel="Add checklist item"
                onClick={handleAddChecklistItem}
                disabled={saving || !form.newChecklistItem.trim()}
              />
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
};

export default TaskEditor;
