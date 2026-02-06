import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskChecklistProgress } from './TaskChecklistProgress';
import type { TaskChecklist } from '../../types';

const makeItems = (completed: number, total: number): TaskChecklist[] =>
  Array.from({ length: total }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i + 1}`,
    completed: i < completed,
  }));

describe('TaskChecklistProgress', () => {
  it('returns null when checklist is empty', () => {
    const { container } = render(<TaskChecklistProgress checklist={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays completed/total count in compact variant', () => {
    render(<TaskChecklistProgress checklist={makeItems(2, 5)} variant="compact" />);
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  it('displays "X of Y complete" in text variant', () => {
    render(<TaskChecklistProgress checklist={makeItems(3, 4)} variant="text" />);
    expect(screen.getByText('3 of 4 complete')).toBeInTheDocument();
  });

  it('displays progress in bar variant', () => {
    render(<TaskChecklistProgress checklist={makeItems(1, 3)} variant="bar" />);
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('renders all-complete state', () => {
    render(<TaskChecklistProgress checklist={makeItems(3, 3)} variant="compact" />);
    expect(screen.getByText('3/3')).toBeInTheDocument();
  });
});
