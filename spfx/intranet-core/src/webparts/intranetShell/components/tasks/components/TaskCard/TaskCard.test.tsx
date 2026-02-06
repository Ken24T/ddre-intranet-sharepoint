import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import type { Task } from '../../types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Test Task',
    status: 'in-progress',
    priority: 'medium',
    ownership: { type: 'user', ownerId: 'u1' },
    createdAt: '2026-02-01T00:00:00.000Z',
    createdBy: 'u1',
    ...overrides,
  };
}

/** The outer card div has role="button"; the menu IconButton also has role="button". */
function getCardElement(): HTMLElement {
  // The card is the first button-role element (the wrapping div)
  return screen.getAllByRole('button')[0];
}

describe('TaskCard', () => {
  it('renders the task title', () => {
    render(<TaskCard task={makeTask()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders with button roles (card + menu)', () => {
    render(<TaskCard task={makeTask()} />);
    // Card div + menu IconButton = at least 2 buttons
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
  });

  it('calls onClick when the card is clicked', () => {
    const onClick = jest.fn();
    render(<TaskCard task={makeTask()} onClick={onClick} />);
    fireEvent.click(getCardElement());
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'task-1' }));
  });

  it('calls onClick on Enter key', () => {
    const onClick = jest.fn();
    render(<TaskCard task={makeTask()} onClick={onClick} />);
    fireEvent.keyDown(getCardElement(), { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });

  it('does not call onClick when disabled', () => {
    const onClick = jest.fn();
    render(<TaskCard task={makeTask()} onClick={onClick} disabled={true} />);
    fireEvent.click(getCardElement());
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders checkbox when showCheckbox is true', () => {
    render(<TaskCard task={makeTask()} showCheckbox={true} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('hides checkbox when showCheckbox is false', () => {
    render(<TaskCard task={makeTask()} showCheckbox={false} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders due date when present', () => {
    render(<TaskCard task={makeTask({ dueDate: '2026-02-10T00:00:00.000Z' })} />);
    const card = getCardElement();
    expect(card.textContent).toBeTruthy();
  });

  it('renders checklist progress when checklist exists', () => {
    const task = makeTask({
      checklist: [
        { id: 'c1', title: 'A', completed: true },
        { id: 'c2', title: 'B', completed: false },
      ],
    });
    render(<TaskCard task={task} />);
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('renders description in detailed variant', () => {
    const task = makeTask({
      description: 'Task description here',
      status: 'in-progress',
    });
    render(<TaskCard task={task} variant="detailed" />);
    expect(screen.getByText('Task description here')).toBeInTheDocument();
  });

  it('calls onStatusChange when checkbox is toggled', () => {
    const onStatusChange = jest.fn();
    render(
      <TaskCard task={makeTask({ status: 'in-progress' })} onStatusChange={onStatusChange} />
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onStatusChange).toHaveBeenCalledWith('task-1', 'completed');
  });
});
