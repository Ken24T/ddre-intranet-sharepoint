import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { TasksProvider, useTasks } from './TasksContext';
import type { CreateTaskRequest } from './types';

// Pin system time for deterministic date comparisons
const PINNED_NOW = new Date('2026-02-06T12:00:00.000Z');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(PINNED_NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// Helper: component that exposes context for testing
// ---------------------------------------------------------------------------

let capturedContext: ReturnType<typeof useTasks>;

const TestConsumer: React.FC = () => {
  capturedContext = useTasks();
  return (
    <div>
      <span data-testid="loading">{String(capturedContext.state.isLoading)}</span>
      <span data-testid="count">{capturedContext.state.tasks.length}</span>
      <span data-testid="error">{capturedContext.state.error?.message ?? ''}</span>
    </div>
  );
};

function renderWithProvider(
  providerProps: Partial<React.ComponentProps<typeof TasksProvider>> = {}
): void {
  render(
    <TasksProvider autoLoad={false} {...providerProps}>
      <TestConsumer />
    </TasksProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TasksContext', () => {
  describe('Provider', () => {
    it('renders children and provides default state', () => {
      renderWithProvider();

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('count')).toHaveTextContent('0');
      expect(screen.getByTestId('error')).toHaveTextContent('');
    });

    it('applies initial filters', () => {
      renderWithProvider({ initialFilters: { status: ['in-progress'] } });

      expect(capturedContext.state.filters.status).toEqual(['in-progress']);
    });
  });

  describe('useTasks hook', () => {
    it('throws when used outside provider', () => {
      // Suppress React error boundary console output
      const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      const Bad: React.FC = () => {
        useTasks();
        return null;
      };

      expect(() => render(<Bad />)).toThrow('useTasks must be used within a TasksProvider');
      spy.mockRestore();
    });
  });

  describe('CRUD operations via mock client', () => {
    it('creates a task and refreshes the list', async () => {
      renderWithProvider();

      const request: CreateTaskRequest = {
        title: 'Write unit tests',
        priority: 'high',
        ownership: { type: 'user', ownerId: 'user-1' },
      };

      let createdTask: Awaited<ReturnType<typeof capturedContext.createTask>>;
      await act(async () => {
        createdTask = await capturedContext.createTask(request);
      });

      expect(createdTask!.title).toBe('Write unit tests');
      expect(createdTask!.priority).toBe('high');
      expect(createdTask!.status).toBe('not-started');
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    it('selects a task by ID', async () => {
      renderWithProvider();

      // Create first
      let task: Awaited<ReturnType<typeof capturedContext.createTask>>;
      await act(async () => {
        task = await capturedContext.createTask({
          title: 'Selectable task',
          ownership: { type: 'user', ownerId: 'u1' },
        });
      });

      // Select
      await act(async () => {
        await capturedContext.selectTask(task!.id);
      });

      expect(capturedContext.state.selectedTask?.id).toBe(task!.id);
      expect(capturedContext.state.selectedTask?.title).toBe('Selectable task');
    });

    it('clears selection when selectTask(undefined) is called', async () => {
      renderWithProvider();

      await act(async () => {
        const t = await capturedContext.createTask({
          title: 'Temp',
          ownership: { type: 'user', ownerId: 'u1' },
        });
        await capturedContext.selectTask(t.id);
      });

      expect(capturedContext.state.selectedTask).toBeDefined();

      await act(async () => {
        await capturedContext.selectTask(undefined);
      });

      expect(capturedContext.state.selectedTask).toBeUndefined();
    });

    it('updates a task', async () => {
      renderWithProvider();

      let taskId: string;
      await act(async () => {
        const t = await capturedContext.createTask({
          title: 'Original',
          ownership: { type: 'user', ownerId: 'u1' },
        });
        taskId = t.id;
      });

      let updated: Awaited<ReturnType<typeof capturedContext.updateTask>>;
      await act(async () => {
        updated = await capturedContext.updateTask(taskId!, { title: 'Updated' });
      });

      expect(updated!.title).toBe('Updated');
    });

    it('deletes a task and removes it from the list', async () => {
      renderWithProvider();

      let taskId: string;
      await act(async () => {
        const t = await capturedContext.createTask({
          title: 'Delete me',
          ownership: { type: 'user', ownerId: 'u1' },
        });
        taskId = t.id;
      });

      expect(screen.getByTestId('count')).toHaveTextContent('1');

      await act(async () => {
        await capturedContext.deleteTask(taskId!);
      });

      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });

    it('changes task status optimistically', async () => {
      renderWithProvider();

      let taskId: string;
      await act(async () => {
        const t = await capturedContext.createTask({
          title: 'Status test',
          ownership: { type: 'user', ownerId: 'u1' },
        });
        taskId = t.id;
      });

      await act(async () => {
        await capturedContext.updateTaskStatus(taskId!, 'completed');
      });

      const task = capturedContext.state.tasks.find((t) => t.id === taskId!);
      expect(task?.status).toBe('completed');
    });
  });

  describe('filter and sort', () => {
    it('updates filters via setFilters', () => {
      renderWithProvider();

      act(() => {
        capturedContext.setFilters({ priority: ['urgent'] });
      });

      expect(capturedContext.state.filters.priority).toEqual(['urgent']);
    });

    it('updates sort via setSort', () => {
      renderWithProvider();

      act(() => {
        capturedContext.setSort({ field: 'priority', order: 'desc' });
      });

      expect(capturedContext.state.sort.field).toBe('priority');
      expect(capturedContext.state.sort.order).toBe('desc');
    });

    it('updates view via setView', () => {
      renderWithProvider();

      act(() => {
        capturedContext.setView('board');
      });

      expect(capturedContext.state.view).toBe('board');
    });
  });

  describe('error handling', () => {
    it('clears errors via clearError', async () => {
      renderWithProvider();

      // Try to select a non-existent task to trigger error
      await act(async () => {
        await capturedContext.selectTask('nonexistent-id');
      });

      expect(capturedContext.state.error).toBeDefined();

      act(() => {
        capturedContext.clearError();
      });

      expect(capturedContext.state.error).toBeUndefined();
    });
  });

  describe('checklist toggling', () => {
    it('toggles a checklist item and auto-updates status', async () => {
      renderWithProvider();

      let taskId: string;
      await act(async () => {
        const t = await capturedContext.createTask({
          title: 'Checklist task',
          ownership: { type: 'user', ownerId: 'u1' },
          checklist: [{ title: 'Item A' }, { title: 'Item B' }],
        });
        taskId = t.id;
        await capturedContext.selectTask(t.id);
      });

      const itemId = capturedContext.state.selectedTask!.checklist![0].id;

      await act(async () => {
        await capturedContext.toggleChecklistItem(taskId!, itemId, true);
      });

      // After toggling one of two items, status should be in-progress
      const selected = capturedContext.state.selectedTask;
      expect(selected?.checklist![0].completed).toBe(true);
      expect(selected?.status).toBe('in-progress');
    });
  });
});
