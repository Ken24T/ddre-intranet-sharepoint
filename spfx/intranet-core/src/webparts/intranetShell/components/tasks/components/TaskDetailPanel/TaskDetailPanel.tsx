/**
 * TaskDetailPanel - Side panel showing full task details with comments and checklist.
 */
import * as React from 'react';
import {
  Panel,
  PanelType,
  IconButton,
  Checkbox,
  TextField,
  PrimaryButton,
  DefaultButton,
  Persona,
  PersonaSize,
  Icon,
  Spinner,
  SpinnerSize,
} from '@fluentui/react';
import type { Task, TaskStatus, TaskChecklist, TaskComment, TaskAssignment } from '../../types';
import { TaskStatusBadge } from '../TaskStatusBadge';
import { TaskPriorityIndicator } from '../TaskPriorityIndicator';
import { TaskDueDateLabel } from '../TaskDueDateLabel';
import styles from './TaskDetailPanel.module.scss';

export interface ITaskDetailPanelProps {
  /** The task to display */
  task: Task | undefined;
  /** Whether the panel is open */
  isOpen: boolean;
  /** Called when the panel is dismissed */
  onDismiss: () => void;
  /** Called when edit is requested */
  onEdit?: (task: Task) => void;
  /** Called when status changes */
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  /** Called when checklist item is toggled */
  onChecklistToggle?: (taskId: string, itemId: string, completed: boolean) => void;
  /** Called when a comment is added */
  onAddComment?: (taskId: string, text: string) => Promise<void>;
  /** Called when task is deleted */
  onDelete?: (taskId: string) => void;
  /** Loading state */
  loading?: boolean;
}

export const TaskDetailPanel: React.FC<ITaskDetailPanelProps> = ({
  task,
  isOpen,
  onDismiss,
  onEdit,
  onStatusChange,
  onChecklistToggle,
  onAddComment,
  onDelete,
  loading = false,
}) => {
  const [newComment, setNewComment] = React.useState('');
  const [submittingComment, setSubmittingComment] = React.useState(false);

  const handleAddComment = React.useCallback(async () => {
    if (!task || !onAddComment || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await onAddComment(task.id, newComment.trim());
      setNewComment('');
    } finally {
      setSubmittingComment(false);
    }
  }, [task, onAddComment, newComment]);

  const handleChecklistChange = React.useCallback(
    (item: TaskChecklist, checked: boolean) => {
      if (task && onChecklistToggle) {
        onChecklistToggle(task.id, item.id, checked);
      }
    },
    [task, onChecklistToggle]
  );

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const onRenderHeader = (): JSX.Element => (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <TaskPriorityIndicator
          priority={task?.priority ?? 'medium'}
          size="medium"
          showLabel
          variant="flag"
        />
        <h2 className={styles.title}>{task?.title}</h2>
      </div>
      <div className={styles.headerActions}>
        {task && onEdit && (
          <IconButton
            iconProps={{ iconName: 'Edit' }}
            title="Edit task"
            ariaLabel="Edit task"
            onClick={() => onEdit(task)}
          />
        )}
        {task && onDelete && (
          <IconButton
            iconProps={{ iconName: 'Delete' }}
            title="Delete task"
            ariaLabel="Delete task"
            onClick={() => {
              if (confirm('Are you sure you want to delete this task?')) {
                onDelete(task.id);
                onDismiss();
              }
            }}
            className={styles.deleteButton}
          />
        )}
        <IconButton
          iconProps={{ iconName: 'Cancel' }}
          title="Close"
          ariaLabel="Close panel"
          onClick={onDismiss}
        />
      </div>
    </div>
  );

  const onRenderFooter = (): JSX.Element => (
    <div className={styles.footer}>
      <DefaultButton onClick={onDismiss}>Close</DefaultButton>
      {task && onEdit && (
        <PrimaryButton onClick={() => onEdit(task)}>Edit task</PrimaryButton>
      )}
    </div>
  );

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.medium}
      onRenderHeader={onRenderHeader}
      onRenderFooterContent={onRenderFooter}
      isFooterAtBottom
      closeButtonAriaLabel="Close"
      className={styles.panel}
    >
      {loading && (
        <div className={styles.loading}>
          <Spinner size={SpinnerSize.large} label="Loading task..." />
        </div>
      )}

      {!loading && task && (
        <div className={styles.content}>
          {/* Status and metadata row */}
          <div className={styles.metaRow}>
            <TaskStatusBadge status={task.status} size="medium" />
            {task.dueDate && (
              <TaskDueDateLabel
                dueDate={task.dueDate}
                status={task.status}
                format="long"
                size="medium"
              />
            )}
          </div>

          {/* Quick status actions */}
          {onStatusChange && (
            <div className={styles.statusActions}>
              <span className={styles.statusLabel}>Change status:</span>
              <div className={styles.statusButtons}>
                {(['not-started', 'in-progress', 'completed', 'cancelled'] as TaskStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      className={`${styles.statusButton} ${task.status === status ? styles.active : ''}`}
                      onClick={() => onStatusChange(task.id, status)}
                      disabled={task.status === status}
                    >
                      <TaskStatusBadge status={status} size="small" showLabel={false} />
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Description</h3>
              <p className={styles.description}>{task.description}</p>
            </div>
          )}

          {/* Hub link */}
          {task.hubLink && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Linked hub</h3>
              <div className={styles.hubLink}>
                <Icon iconName="ViewDashboard" className={styles.hubIcon} />
                <span>{task.hubLink.hubDisplayName ?? 'Hub'}</span>
              </div>
            </div>
          )}

          {/* Checklist */}
          {task.checklist && task.checklist.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Checklist ({task.checklist.filter((c: TaskChecklist) => c.completed).length}/
                {task.checklist.length})
              </h3>
              <div className={styles.checklist}>
                {task.checklist.map((item: TaskChecklist) => (
                  <div key={item.id} className={styles.checklistItem}>
                    <Checkbox
                      checked={item.completed}
                      onChange={(_, checked) => handleChecklistChange(item, checked ?? false)}
                      label={item.title}
                      disabled={!onChecklistToggle}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignments */}
          {task.assignments && task.assignments.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Assigned to</h3>
              <div className={styles.assignments}>
                {task.assignments.map((assignment: TaskAssignment) => (
                  <Persona
                    key={assignment.userId}
                    text={assignment.userDisplayName ?? assignment.userId}
                    size={PersonaSize.size32}
                    className={styles.assignee}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Comments {task.comments && task.comments.length > 0 && `(${task.comments.length})`}
            </h3>

            {/* Comment list */}
            {task.comments && task.comments.length > 0 && (
              <div className={styles.comments}>
                {task.comments.map((comment: TaskComment) => (
                  <div key={comment.id} className={styles.comment}>
                    <Persona
                      text={comment.authorDisplayName ?? comment.authorId}
                      size={PersonaSize.size24}
                      className={styles.commentAuthor}
                    />
                    <div className={styles.commentContent}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentName}>{comment.authorDisplayName ?? 'Unknown'}</span>
                        <span className={styles.commentTime}>
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className={styles.commentText}>{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment form */}
            {onAddComment && (
              <div className={styles.addComment}>
                <TextField
                  placeholder="Add a comment..."
                  multiline
                  rows={2}
                  value={newComment}
                  onChange={(_, value) => setNewComment(value ?? '')}
                  disabled={submittingComment}
                />
                <PrimaryButton
                  text="Add comment"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                  className={styles.addCommentButton}
                />
              </div>
            )}
          </div>

          {/* Metadata footer */}
          <div className={styles.metadata}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Created:</span>
              <span>{formatDateTime(task.createdAt)}</span>
            </div>
            {task.updatedAt && (
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Updated:</span>
                <span>{formatDateTime(task.updatedAt)}</span>
              </div>
            )}
            {task.createdBy && (
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Created by:</span>
                <span>{task.createdBy}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
};

export default TaskDetailPanel;
