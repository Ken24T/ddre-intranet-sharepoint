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
  Toggle,
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
  TaskAssignment,
} from '../../types';
import { TaskAssignmentPicker } from '../TaskAssignmentPicker';
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
  /** Initial draft values for create mode */
  initialDraft?: Partial<CreateTaskRequest>;
  /** Existing task titles to prevent duplicates */
  existingTitles?: string[];
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
  ownershipType: TaskOwnership['type'];
  ownerId: string;
  ownerDisplayName: string;
  assignments: TaskAssignment[];
  doNotNotify: boolean;
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

const ownershipOptions: IDropdownOption[] = [
  { key: 'user', text: 'User' },
  { key: 'team', text: 'Team' },
  { key: 'group', text: 'Group' },
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
  initialDraft,
  existingTitles = [],
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
    ownershipType: defaultOwnership?.type ?? 'user',
    ownerId: defaultOwnership?.ownerId ?? '',
    ownerDisplayName: defaultOwnership?.ownerDisplayName ?? '',
    assignments: [],
    doNotNotify: false,
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
          ownershipType: task.ownership.type,
          ownerId: task.ownership.ownerId,
          ownerDisplayName: task.ownership.ownerDisplayName ?? '',
          assignments: task.assignments ?? [],
          doNotNotify: task.doNotNotify ?? false,
        });
      } else {
        setForm({
          title: initialDraft?.title ?? '',
          description: initialDraft?.description ?? '',
          status: initialDraft?.status ?? 'not-started',
          priority: initialDraft?.priority ?? 'medium',
          dueDate: initialDraft?.dueDate ? new Date(initialDraft.dueDate) : undefined,
          hubId: initialDraft?.hubLink?.hubId ?? defaultHubLink?.hubId ?? '',
          checklist:
            initialDraft?.checklist?.map((item, index) => ({
              id: generateId(),
              title: item.title,
              completed: false,
              sortOrder: index,
            })) ?? [],
          newChecklistItem: '',
          ownershipType: initialDraft?.ownership?.type ?? defaultOwnership?.type ?? 'user',
          ownerId: initialDraft?.ownership?.ownerId ?? defaultOwnership?.ownerId ?? '',
          ownerDisplayName:
            initialDraft?.ownership?.ownerDisplayName ??
            defaultOwnership?.ownerDisplayName ??
            '',
          assignments:
            initialDraft?.assignments?.map((assignment) => ({
              userId: assignment.userId,
              role: assignment.role,
            })) ?? [],
          doNotNotify: initialDraft?.doNotNotify ?? false,
        });
      }
      setErrors({});
    }
  }, [isOpen, task, defaultHubLink, initialDraft, defaultOwnership]);

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

  const handleOwnershipTypeChange = React.useCallback(
    (_: React.FormEvent, option?: IDropdownOption) => {
      if (option) {
        setForm((prev) => ({ ...prev, ownershipType: option.key as TaskOwnership['type'] }));
      }
    },
    []
  );

  const handleOwnerIdChange = React.useCallback(
    (_: React.FormEvent, value?: string) => {
      setForm((prev) => ({ ...prev, ownerId: value ?? '' }));
    },
    []
  );

  const handleOwnerDisplayNameChange = React.useCallback(
    (_: React.FormEvent, value?: string) => {
      setForm((prev) => ({ ...prev, ownerDisplayName: value ?? '' }));
    },
    []
  );

  const handleAssignmentsChange = React.useCallback((assignments: TaskAssignment[]) => {
    setForm((prev) => ({ ...prev, assignments }));
  }, []);

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

  const handleDoNotNotifyChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, checked?: boolean) => {
      setForm((prev) => ({ ...prev, doNotNotify: checked ?? false }));
    },
    []
  );

  // Validation
  const validate = React.useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (form.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or fewer';
    }

    if (!isEditMode) {
      const normalisedTitles = existingTitles.map((t) => t.trim().toLowerCase());
      const nextTitle = form.title.trim().toLowerCase();
      const draftTitle = initialDraft?.title?.trim().toLowerCase();
      const isSameAsDraft = draftTitle ? draftTitle === nextTitle : false;
      if (nextTitle && normalisedTitles.indexOf(nextTitle) !== -1 && !isSameAsDraft) {
        newErrors.title = 'A task with this title already exists';
      }
    }

    if (!isEditMode && form.ownershipType !== 'user' && !form.ownerId.trim()) {
      newErrors.general = 'Please provide an owner ID for team or group tasks.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form.title, form.ownerId, form.ownershipType, isEditMode, existingTitles, initialDraft]);

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
          checklist: form.checklist.map((item) => ({
            id: item.id,
            title: item.title,
            completed: item.completed,
            sortOrder: item.sortOrder,
          })),
          doNotNotify: form.doNotNotify,
        };
        await onSave(updateData);
      } else {
        // Create new task
        const ownership: TaskOwnership = {
          type: form.ownershipType,
          ownerId:
            form.ownerId.trim() ||
            defaultOwnership?.ownerId ||
            'current-user',
          ownerDisplayName: form.ownerDisplayName || defaultOwnership?.ownerDisplayName,
        };

        const createData: CreateTaskRequest = {
          title: form.title,
          description: form.description || undefined,
          status: form.status,
          priority: form.priority,
          ownership,
          assignments: form.assignments.map((assignment) => ({
            userId: assignment.userId,
            role: assignment.role,
          })),
          hubLink,
          dueDate: form.dueDate?.toISOString(),
          checklist: form.checklist.map((item) => ({ title: item.title })),
          doNotNotify: form.doNotNotify,
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
            <Dropdown
              label="Status"
              options={statusOptions}
              selectedKey={form.status}
              onChange={handleStatusChange}
              disabled={saving}
              className={styles.halfWidth}
            />
            <Dropdown
              label="Priority"
              options={priorityOptions}
              selectedKey={form.priority}
              onChange={handlePriorityChange}
              disabled={saving}
              className={styles.halfWidth}
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

          {/* Ownership */}
          <div className={styles.section}>
            <Label>Assign to</Label>
            <div className={styles.row}>
              <Dropdown
                label="Owner type"
                options={ownershipOptions}
                selectedKey={form.ownershipType}
                onChange={handleOwnershipTypeChange}
                disabled={saving || isEditMode}
                className={styles.halfWidth}
              />
              <TextField
                label={form.ownershipType === 'user' ? 'Owner user ID' : 'Owner group/team ID'}
                value={form.ownerId}
                onChange={handleOwnerIdChange}
                placeholder={
                  form.ownershipType === 'user'
                    ? 'Leave blank to assign to yourself'
                    : 'Enter group or team ID'
                }
                disabled={saving || isEditMode}
                className={styles.halfWidth}
              />
            </div>
            <TextField
              label="Owner display name (optional)"
              value={form.ownerDisplayName}
              onChange={handleOwnerDisplayNameChange}
              placeholder="Name shown to users"
              disabled={saving || isEditMode}
            />
            <TaskAssignmentPicker
              assignments={form.assignments}
              onChange={handleAssignmentsChange}
              label="Additional assignees"
              disabled={saving || isEditMode}
            />
          </div>

          {/* Hub Link */}
          {hubOptions.length > 1 && (
            <Dropdown
              label="Assign to hub"
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

          {/* Notification Settings */}
          <div className={styles.section}>
            <Label>Notifications</Label>
            <Toggle
              label="Do not notify me about this task"
              checked={form.doNotNotify}
              onChange={handleDoNotNotifyChange}
              disabled={saving}
              onText="Notifications disabled"
              offText="Notifications enabled"
              inlineLabel
            />
          </div>
        </div>
      )}
    </Panel>
  );
};

export default TaskEditor;
