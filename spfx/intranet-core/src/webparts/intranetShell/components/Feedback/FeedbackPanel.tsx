import * as React from 'react';
import { Panel, PanelType } from '@fluentui/react';
import { FeedbackForm } from './FeedbackForm';
import type { FeedbackCategory } from './FeedbackForm';

export interface IFeedbackPanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  initialCategory?: FeedbackCategory;
  sourceContext?: string;
}

export const FeedbackPanel: React.FC<IFeedbackPanelProps> = ({
  isOpen,
  onDismiss,
  initialCategory,
  sourceContext,
}) => {
  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.medium}
      headerText="Send Feedback"
      closeButtonAriaLabel="Close feedback panel"
      isLightDismiss
      styles={{
        main: {
          padding: 0,
        },
        scrollableContent: {
          padding: 0,
        },
        content: {
          padding: 0,
        },
      }}
    >
      <FeedbackForm
        onSubmitSuccess={onDismiss}
        onCancel={onDismiss}
        initialCategory={initialCategory}
        sourceContext={sourceContext}
      />
    </Panel>
  );
};

export default FeedbackPanel;
