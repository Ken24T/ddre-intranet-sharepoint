import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskStatusBadge } from './TaskStatusBadge';

describe('TaskStatusBadge', () => {
  it('renders not-started status with label', () => {
    render(<TaskStatusBadge status="not-started" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: Not Started');
    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('renders in-progress status', () => {
    render(<TaskStatusBadge status="in-progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders completed status', () => {
    render(<TaskStatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders cancelled status', () => {
    render(<TaskStatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<TaskStatusBadge status="completed" showLabel={false} />);
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    // Should still have accessible label via aria-label
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: Completed');
  });

  it('hides icon when showIcon is false', () => {
    const { container } = render(<TaskStatusBadge status="completed" showIcon={false} />);
    // The Fluent UI Icon renders an <i> — should not be present
    expect(container.querySelector('i')).toBeNull();
  });
});
