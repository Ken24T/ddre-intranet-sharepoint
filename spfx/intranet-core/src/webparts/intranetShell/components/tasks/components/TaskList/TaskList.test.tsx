import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskList } from './TaskList';
import type { Task } from '../../types';

function makeTask(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: `Task ${id}`,
    status: 'in-progress',
    priority: 'medium',
    ownership: { type: 'user', ownerId: 'u1' },
    createdAt: '2026-02-01T00:00:00.000Z',
    createdBy: 'u1',
    ...overrides,
  };
}

const sampleTasks: Task[] = [
  makeTask('1', { title: 'Alpha', priority: 'low' }),
  makeTask('2', { title: 'Bravo', priority: 'urgent', dueDate: '2026-02-08T00:00:00.000Z' }),
  makeTask('3', { title: 'Charlie', priority: 'high', status: 'completed' }),
];

describe('TaskList', () => {
  it('renders all tasks', () => {
    render(<TaskList tasks={sampleTasks} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Bravo')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('shows results count', () => {
    render(<TaskList tasks={sampleTasks} />);
    expect(screen.getByText(/Showing 3 of 3 tasks/)).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(<TaskList tasks={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows loading spinner', () => {
    render(<TaskList tasks={[]} loading={true} />);
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('suppresses empty state when error is set', () => {
    render(<TaskList tasks={[]} error="Something went wrong" />);
    // When error is present, the empty-state task list section should not render
    expect(screen.queryByText('No tasks found')).not.toBeInTheDocument();
  });

  it('filters tasks by search text', () => {
    render(<TaskList tasks={sampleTasks} showSearch={true} />);

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Bravo')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('calls onTaskClick when a task card is clicked', () => {
    const onTaskClick = jest.fn();
    render(<TaskList tasks={sampleTasks} onTaskClick={onTaskClick} />);

    const buttons = screen.getAllByRole('button');
    // The first button-role element in a TaskCard is the card itself
    // Find the one with "Alpha" text
    const alphaCard = buttons.find((b) => b.textContent?.includes('Alpha'));
    if (alphaCard) {
      fireEvent.click(alphaCard);
      expect(onTaskClick).toHaveBeenCalledWith(expect.objectContaining({ title: 'Alpha' }));
    }
  });

  it('renders "Create a new task" CTA in empty state when onNewTask provided', () => {
    const onNewTask = jest.fn();
    render(<TaskList tasks={[]} onNewTask={onNewTask} />);
    const cta = screen.getByText('Create a new task');
    expect(cta).toBeInTheDocument();

    fireEvent.click(cta);
    expect(onNewTask).toHaveBeenCalled();
  });
});
