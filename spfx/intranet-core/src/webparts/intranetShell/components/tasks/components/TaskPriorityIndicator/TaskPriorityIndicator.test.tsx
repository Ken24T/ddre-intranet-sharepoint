import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskPriorityIndicator } from './TaskPriorityIndicator';

describe('TaskPriorityIndicator', () => {
  it('renders with accessible label for urgent priority', () => {
    render(<TaskPriorityIndicator priority="urgent" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Priority: Urgent');
  });

  it('renders with accessible label for high priority', () => {
    render(<TaskPriorityIndicator priority="high" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Priority: High');
  });

  it('renders with accessible label for medium priority', () => {
    render(<TaskPriorityIndicator priority="medium" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Priority: Medium');
  });

  it('renders with accessible label for low priority', () => {
    render(<TaskPriorityIndicator priority="low" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Priority: Low');
  });

  it('shows label when showLabel is true', () => {
    render(<TaskPriorityIndicator priority="high" showLabel={true} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('hides label by default', () => {
    render(<TaskPriorityIndicator priority="high" />);
    expect(screen.queryByText('High')).not.toBeInTheDocument();
  });

  it('renders with title attribute for tooltip', () => {
    render(<TaskPriorityIndicator priority="urgent" />);
    expect(screen.getByRole('img')).toHaveAttribute('title', 'Urgent');
  });
});
