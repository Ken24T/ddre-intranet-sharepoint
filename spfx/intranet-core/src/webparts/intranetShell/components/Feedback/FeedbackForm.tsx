import * as React from 'react';
import {
  DefaultButton,
  Dropdown,
  Icon,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  TextField,
  useTheme,
} from '@fluentui/react';
import type { IDropdownOption } from '@fluentui/react';
import styles from './FeedbackForm.module.scss';
import { useAudit } from '../AuditContext';

export interface IFeedbackFormProps {
  /** Called when the form is successfully submitted */
  onSubmitSuccess?: () => void;
  /** Called when the user cancels */
  onCancel?: () => void;
  /** Pre-selected category */
  initialCategory?: FeedbackCategory;
  /** Context about where the form was opened from */
  sourceContext?: string;
}

export type FeedbackCategory = 'bug' | 'feature' | 'content' | 'access' | 'other';

interface IFeedbackFormState {
  category: FeedbackCategory | '';
  title: string;
  description: string;
  email: string;
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | undefined;
}

const categoryOptions: IDropdownOption[] = [
  { key: 'bug', text: 'Report a bug', data: { icon: 'Bug' } },
  { key: 'feature', text: 'Request a feature', data: { icon: 'Lightbulb' } },
  { key: 'content', text: 'Content issue', data: { icon: 'TextDocument' } },
  { key: 'access', text: 'Access problem', data: { icon: 'Lock' } },
  { key: 'other', text: 'Other feedback', data: { icon: 'Comment' } },
];

const getCategoryIcon = (category: FeedbackCategory): string => {
  switch (category) {
    case 'bug': return 'Bug';
    case 'feature': return 'Lightbulb';
    case 'content': return 'TextDocument';
    case 'access': return 'Lock';
    case 'other': return 'Comment';
    default: return 'Comment';
  }
};

const getCategoryLabel = (category: FeedbackCategory): string => {
  switch (category) {
    case 'bug': return 'Bug Report';
    case 'feature': return 'Feature Request';
    case 'content': return 'Content Issue';
    case 'access': return 'Access Problem';
    case 'other': return 'General Feedback';
    default: return 'Feedback';
  }
};

export const FeedbackForm: React.FC<IFeedbackFormProps> = ({
  onSubmitSuccess,
  onCancel,
  initialCategory,
  sourceContext,
}) => {
  const theme = useTheme();
  const audit = useAudit();
  const [state, setState] = React.useState<IFeedbackFormState>({
    category: initialCategory || '',
    title: '',
    description: '',
    email: '',
    isSubmitting: false,
    isSubmitted: false,
    error: undefined,
  });

  const handleCategoryChange = (_: React.FormEvent, option?: IDropdownOption): void => {
    if (option) {
      setState(prev => ({ ...prev, category: option.key as FeedbackCategory, error: undefined }));
    }
  };

  const handleTitleChange = (_: React.FormEvent, value?: string): void => {
    setState(prev => ({ ...prev, title: value || '', error: undefined }));
  };

  const handleDescriptionChange = (_: React.FormEvent, value?: string): void => {
    setState(prev => ({ ...prev, description: value || '', error: undefined }));
  };

  const handleEmailChange = (_: React.FormEvent, value?: string): void => {
    setState(prev => ({ ...prev, email: value || '', error: undefined }));
  };

  const validateForm = (): boolean => {
    if (!state.category) {
      setState(prev => ({ ...prev, error: 'Please select a category' }));
      return false;
    }
    if (!state.title.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a title' }));
      return false;
    }
    if (!state.description.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a description' }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setState(prev => ({ ...prev, isSubmitting: true, error: undefined }));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log to audit system
    audit.logUserInteraction('feedback_form_submitted', {
      metadata: {
        category: state.category,
        title: state.title,
        hasEmail: Boolean(state.email),
        sourceContext,
      },
    });

    setState(prev => ({ ...prev, isSubmitting: false, isSubmitted: true }));

    if (onSubmitSuccess) {
      // Delay to show success state
      setTimeout(onSubmitSuccess, 2000);
    }
  };

  const handleReset = (): void => {
    setState({
      category: '',
      title: '',
      description: '',
      email: '',
      isSubmitting: false,
      isSubmitted: false,
      error: undefined,
    });
  };

  const formClassName = `${styles.feedbackForm} ${theme.isInverted ? styles.dark : ''}`;

  // Success state
  if (state.isSubmitted) {
    return (
      <div className={formClassName}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <Icon iconName="CheckMark" />
          </div>
          <h2 className={styles.successTitle}>Thank you!</h2>
          <p className={styles.successMessage}>
            Your {getCategoryLabel(state.category as FeedbackCategory).toLowerCase()} has been submitted.
            We&apos;ll review it and get back to you if needed.
          </p>
          <div className={styles.successActions}>
            <DefaultButton
              text="Submit another"
              onClick={handleReset}
            />
            {onCancel && (
              <PrimaryButton
                text="Done"
                onClick={onCancel}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={formClassName}>
      <div className={styles.header}>
        <Icon iconName="Feedback" className={styles.headerIcon} />
        <div>
          <h2 className={styles.headerTitle}>Send Feedback</h2>
          <p className={styles.headerSubtitle}>
            Help us improve the intranet by reporting issues or sharing ideas.
          </p>
        </div>
      </div>

      {state.error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          onDismiss={() => setState(prev => ({ ...prev, error: undefined }))}
          dismissButtonAriaLabel="Close"
          className={styles.errorBar}
        >
          {state.error}
        </MessageBar>
      )}

      <div className={styles.formFields}>
        <Dropdown
          label="What type of feedback is this?"
          placeholder="Select a category"
          options={categoryOptions}
          selectedKey={state.category}
          onChange={handleCategoryChange}
          required
          onRenderOption={(option) => (
            <div className={styles.categoryOption}>
              <Icon iconName={option?.data?.icon || 'Comment'} className={styles.categoryIcon} />
              <span>{option?.text}</span>
            </div>
          )}
          onRenderTitle={(options) => {
            const selected = options?.[0];
            if (!selected) return null;
            return (
              <div className={styles.categoryOption}>
                <Icon iconName={selected.data?.icon || 'Comment'} className={styles.categoryIcon} />
                <span>{selected.text}</span>
              </div>
            );
          }}
        />

        <TextField
          label="Title"
          placeholder="Brief summary of your feedback"
          value={state.title}
          onChange={handleTitleChange}
          required
          maxLength={100}
        />

        <TextField
          label="Description"
          placeholder="Please provide as much detail as possible..."
          value={state.description}
          onChange={handleDescriptionChange}
          required
          multiline
          rows={5}
          maxLength={2000}
        />

        <TextField
          label="Email (optional)"
          placeholder="your.email@ddre.com.au"
          description="Only if you'd like us to follow up with you"
          value={state.email}
          onChange={handleEmailChange}
          type="email"
        />
      </div>

      {state.category && (
        <div className={styles.categoryHint}>
          <Icon iconName={getCategoryIcon(state.category as FeedbackCategory)} className={styles.hintIcon} />
          <span>
            {state.category === 'bug' && 'Include steps to reproduce the issue if possible.'}
            {state.category === 'feature' && 'Describe the problem this feature would solve.'}
            {state.category === 'content' && 'Let us know which content is incorrect or outdated.'}
            {state.category === 'access' && 'Include which tool or area you cannot access.'}
            {state.category === 'other' && 'Share any thoughts or suggestions.'}
          </span>
        </div>
      )}

      <div className={styles.formActions}>
        {onCancel && (
          <DefaultButton
            text="Cancel"
            onClick={onCancel}
            disabled={state.isSubmitting}
          />
        )}
        <PrimaryButton
          text={state.isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          onClick={handleSubmit}
          disabled={state.isSubmitting}
          iconProps={state.isSubmitting ? undefined : { iconName: 'Send' }}
        />
      </div>

      <div className={styles.disclaimer}>
        <Icon iconName="Info" className={styles.disclaimerIcon} />
        <span>
          Feedback is reviewed by the Intranet Team. For urgent IT issues, please contact the{' '}
          <a href="mailto:servicedesk@ddre.com.au" className={styles.link}>IT Service Desk</a>.
        </span>
      </div>
    </div>
  );
};

export default FeedbackForm;
