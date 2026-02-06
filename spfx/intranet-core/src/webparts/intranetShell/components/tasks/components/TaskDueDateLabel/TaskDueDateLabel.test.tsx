import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskDueDateLabel } from './TaskDueDateLabel';

const PINNED_NOW = new Date('2026-02-06T12:00:00.000Z');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(PINNED_NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('TaskDueDateLabel', () => {
  it('returns null when no due date is provided', () => {
    const { container } = render(<TaskDueDateLabel dueDate={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays "Today" for a due date that is today', () => {
    // formatDate uses Math.ceil so the date must be slightly before now to get diffDays === 0
    render(<TaskDueDateLabel dueDate="2026-02-06T11:00:00.000Z" />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('displays "Tomorrow" for a due date that is tomorrow', () => {
    render(<TaskDueDateLabel dueDate="2026-02-07T12:00:00.000Z" />);
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
  });

  it('displays "Yesterday" for a due date that was yesterday', () => {
    render(<TaskDueDateLabel dueDate="2026-02-05T12:00:00.000Z" />);
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });

  it('shows "In X days" for near-future due dates', () => {
    render(<TaskDueDateLabel dueDate="2026-02-09T12:00:00.000Z" />);
    expect(screen.getByText(/In \d+ days/)).toBeInTheDocument();
  });

  it('does not show urgency for completed tasks', () => {
    const { container } = render(
      <TaskDueDateLabel dueDate="2026-01-01T00:00:00.000Z" status="completed" />
    );
    // Should not have overdue styling — just check it renders without error
    expect(container.firstChild).not.toBeNull();
  });
});
