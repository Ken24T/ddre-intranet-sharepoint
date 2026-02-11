/**
 * IntranetShellWithTasks - Functional wrapper for IntranetShell that uses TasksContext
 *
 * This component uses the useTasks hook to get task data and wires it up
 * to the IntranetShell and its widgets.
 */

import * as React from 'react';
import IntranetShell from './IntranetShell';
import { useTasks } from './tasks/TasksContext';
import { useTaskCounts } from './tasks/hooks';
import { useAudit } from './AuditContext';
import type { IAuditEventMessage } from './appBridge';
import type { IIntranetShellProps } from './IIntranetShellProps';

export interface IIntranetShellWithTasksProps extends IIntranetShellProps {
  // All IntranetShell props passed through
}

/**
 * Wrapper component that adds task context integration to IntranetShell
 */
export const IntranetShellWithTasks: React.FC<IIntranetShellWithTasksProps> = (
  props
) => {
  // Get tasks data from context
  const { state } = useTasks();
  const { tasks, isLoading, error } = state;

  // Get task counts
  const { overdueCount, dueSoonCount, totalCount } = useTaskCounts();

  // Get shell audit logger for app-bridge relay
  const shellAudit = useAudit();

  // Handle audit events from embedded apps (e.g. Marketing Budget)
  const handleAppAuditEvent = React.useCallback(
    (event: IAuditEventMessage): void => {
      shellAudit.logUserInteraction('feedback_form_submitted', {
        hub: 'sales',
        tool: event.source,
        metadata: {
          entityType: event.entityType,
          action: event.action,
          summary: event.summary,
        },
      });
    },
    [shellAudit],
  );

  // When task counts change, update the shell state if it exists
  React.useEffect(() => {
    // The shell will use this in its render via state
    // For now we'll store it in a ref that can be accessed
  }, [overdueCount, dueSoonCount, totalCount]);

  // Log task state for debugging (remove in production)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Tasks] State:', {
        taskCount: tasks.length,
        isLoading,
        error,
        overdueCount,
        dueSoonCount,
        totalCount,
      });
    }
  }, [tasks, isLoading, error, overdueCount, dueSoonCount, totalCount]);

  // Pass through all props - task data will be available globally via hooks
  return <IntranetShell {...props} onAppAuditEvent={handleAppAuditEvent} />;
};

export default IntranetShellWithTasks;
