import {
  isTaskOverdue,
  isTaskDueSoon,
  getPriorityWeight,
  getStatusLabel,
  getPriorityLabel,
  TaskSummary,
} from './types';

// Pin system time so date-relative logic is deterministic
const PINNED_NOW = new Date('2026-02-06T12:00:00.000Z');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(PINNED_NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// Helper to build a minimal TaskSummary
// ---------------------------------------------------------------------------
function makeSummary(
  overrides: Partial<TaskSummary> = {}
): TaskSummary {
  return {
    id: 'task-1',
    title: 'Test Task',
    status: 'in-progress',
    priority: 'medium',
    ownership: { type: 'user', ownerId: 'u1' },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// isTaskOverdue
// ---------------------------------------------------------------------------
describe('isTaskOverdue', () => {
  it('returns false when there is no due date', () => {
    expect(isTaskOverdue(makeSummary({ dueDate: undefined }))).toBe(false);
  });

  it('returns true when due date is in the past', () => {
    expect(isTaskOverdue(makeSummary({ dueDate: '2026-02-04T00:00:00.000Z' }))).toBe(true);
  });

  it('returns false when due date is in the future', () => {
    expect(isTaskOverdue(makeSummary({ dueDate: '2026-02-10T00:00:00.000Z' }))).toBe(false);
  });

  it('returns false for completed tasks even when overdue', () => {
    expect(
      isTaskOverdue(makeSummary({ dueDate: '2026-01-01T00:00:00.000Z', status: 'completed' }))
    ).toBe(false);
  });

  it('returns false for cancelled tasks even when overdue', () => {
    expect(
      isTaskOverdue(makeSummary({ dueDate: '2026-01-01T00:00:00.000Z', status: 'cancelled' }))
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isTaskDueSoon
// ---------------------------------------------------------------------------
describe('isTaskDueSoon', () => {
  it('returns false when there is no due date', () => {
    expect(isTaskDueSoon(makeSummary())).toBe(false);
  });

  it('returns true when due within the default 48-hour window', () => {
    // 24 hours from pinned now
    const dueDate = new Date(PINNED_NOW.getTime() + 24 * 60 * 60 * 1000).toISOString();
    expect(isTaskDueSoon(makeSummary({ dueDate }))).toBe(true);
  });

  it('returns false when due further than 48 hours out', () => {
    const dueDate = new Date(PINNED_NOW.getTime() + 72 * 60 * 60 * 1000).toISOString();
    expect(isTaskDueSoon(makeSummary({ dueDate }))).toBe(false);
  });

  it('returns false when already overdue', () => {
    expect(isTaskDueSoon(makeSummary({ dueDate: '2026-02-04T00:00:00.000Z' }))).toBe(false);
  });

  it('respects custom withinHours parameter', () => {
    const dueDate = new Date(PINNED_NOW.getTime() + 5 * 60 * 60 * 1000).toISOString();
    expect(isTaskDueSoon(makeSummary({ dueDate }), 4)).toBe(false);
    expect(isTaskDueSoon(makeSummary({ dueDate }), 6)).toBe(true);
  });

  it('returns false for completed tasks', () => {
    const dueDate = new Date(PINNED_NOW.getTime() + 1 * 60 * 60 * 1000).toISOString();
    expect(isTaskDueSoon(makeSummary({ dueDate, status: 'completed' }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getPriorityWeight
// ---------------------------------------------------------------------------
describe('getPriorityWeight', () => {
  it('returns 4 for urgent', () => expect(getPriorityWeight('urgent')).toBe(4));
  it('returns 3 for high', () => expect(getPriorityWeight('high')).toBe(3));
  it('returns 2 for medium', () => expect(getPriorityWeight('medium')).toBe(2));
  it('returns 1 for low', () => expect(getPriorityWeight('low')).toBe(1));
});

// ---------------------------------------------------------------------------
// getStatusLabel
// ---------------------------------------------------------------------------
describe('getStatusLabel', () => {
  it('returns "Not Started" for not-started', () => {
    expect(getStatusLabel('not-started')).toBe('Not Started');
  });
  it('returns "In Progress" for in-progress', () => {
    expect(getStatusLabel('in-progress')).toBe('In Progress');
  });
  it('returns "Completed" for completed', () => {
    expect(getStatusLabel('completed')).toBe('Completed');
  });
  it('returns "Cancelled" for cancelled', () => {
    expect(getStatusLabel('cancelled')).toBe('Cancelled');
  });
});

// ---------------------------------------------------------------------------
// getPriorityLabel
// ---------------------------------------------------------------------------
describe('getPriorityLabel', () => {
  it('returns "Low" for low', () => expect(getPriorityLabel('low')).toBe('Low'));
  it('returns "Medium" for medium', () => expect(getPriorityLabel('medium')).toBe('Medium'));
  it('returns "High" for high', () => expect(getPriorityLabel('high')).toBe('High'));
  it('returns "Urgent" for urgent', () => expect(getPriorityLabel('urgent')).toBe('Urgent'));
});
