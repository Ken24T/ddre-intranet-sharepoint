import * as React from 'react';
import { DefaultButton, Dropdown, Icon, IconButton, MessageBar, MessageBarType, PrimaryButton, SearchBox, useTheme } from '@fluentui/react';
import { marked } from 'marked';
import styles from './HelpCenter.module.scss';
import type { IFunctionCard } from '../FunctionCard';
import { hubInfo } from '../data';
import { openMockHelpWindow } from '../utils/helpMock';
import type { IRelatedArticle } from '../utils/helpMock';
import { WhatsNew } from '../WhatsNew';
import { useAudit } from '../AuditContext';
import { FeedbackPanel } from '../Feedback';

export interface IHelpCenterProps {
  cards: IFunctionCard[];
  onClose?: () => void;
}

/** Relationship type between articles */
export type RelationshipType = 'prerequisite' | 'next_step' | 'related_topic' | 'troubleshooting';

interface IGeneralHelpCard {
  id: string;
  title: string;
  summary: string;
  category: string;
  helpUrl: string;
  owner: string;
  updatedAt: string;
  contentType: 'Guide' | 'Checklist' | 'Video' | 'Wizard' | 'Walk-through' | 'FAQ' | 'Policy' | 'Quick Reference';
}

/** Related articles mapping - articleId to related articles */
const relatedArticlesMap: Record<string, IRelatedArticle[]> = {
  // Getting Started relationships
  'getting-started': [
    { articleId: 'personalisation', title: 'Personalising Your View', relationshipType: 'next_step' },
    { articleId: 'shortcuts', title: 'Keyboard Shortcuts', relationshipType: 'related_topic' },
    { articleId: 'walkthroughs', title: 'Guided Walk-throughs', relationshipType: 'related_topic' },
  ],
  'settings': [
    { articleId: 'personalisation', title: 'Personalising Your View', relationshipType: 'related_topic' },
    { articleId: 'troubleshooting', title: 'Troubleshooting Common Issues', relationshipType: 'troubleshooting' },
  ],
  'personalisation': [
    { articleId: 'getting-started', title: 'Getting Started with the Intranet', relationshipType: 'prerequisite' },
    { articleId: 'settings', title: 'Settings & Preferences', relationshipType: 'related_topic' },
  ],
  'search': [
    { articleId: 'shortcuts', title: 'Keyboard Shortcuts', relationshipType: 'related_topic' },
    { articleId: 'troubleshooting', title: 'Troubleshooting Common Issues', relationshipType: 'troubleshooting' },
  ],
  'troubleshooting': [
    { articleId: 'help-faqs', title: 'Help Centre FAQs', relationshipType: 'related_topic' },
    { articleId: 'settings', title: 'Settings & Preferences', relationshipType: 'related_topic' },
  ],
  'shortcuts': [
    { articleId: 'quick-reference', title: 'Quick Reference Sheets', relationshipType: 'related_topic' },
    { articleId: 'search', title: 'Search Tips', relationshipType: 'related_topic' },
  ],
  'quick-reference': [
    { articleId: 'shortcuts', title: 'Keyboard Shortcuts', relationshipType: 'related_topic' },
    { articleId: 'walkthroughs', title: 'Guided Walk-throughs', relationshipType: 'next_step' },
  ],
  'walkthroughs': [
    { articleId: 'getting-started', title: 'Getting Started with the Intranet', relationshipType: 'prerequisite' },
    { articleId: 'video-tutorials', title: 'Video Tutorials', relationshipType: 'related_topic' },
  ],
  'video-tutorials': [
    { articleId: 'walkthroughs', title: 'Guided Walk-throughs', relationshipType: 'related_topic' },
    { articleId: 'getting-started', title: 'Getting Started with the Intranet', relationshipType: 'prerequisite' },
  ],
  'help-faqs': [
    { articleId: 'troubleshooting', title: 'Troubleshooting Common Issues', relationshipType: 'troubleshooting' },
    { articleId: 'getting-started', title: 'Getting Started with the Intranet', relationshipType: 'prerequisite' },
  ],
  'policy-basics': [
    { articleId: 'help-faqs', title: 'Help Centre FAQs', relationshipType: 'related_topic' },
    { articleId: 'getting-started', title: 'Getting Started with the Intranet', relationshipType: 'prerequisite' },
  ],
};

const generalHelpCards: IGeneralHelpCard[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with the Intranet',
    summary: 'Learn the basics of navigating hubs and finding your tools quickly.',
    category: 'Getting Started',
    helpUrl: '/help/getting-started',
    owner: 'People & Culture',
    updatedAt: '2026-01-10',
    contentType: 'Guide',
  },
  {
    id: 'settings',
    title: 'Settings & Preferences',
    summary: 'Change your theme, sidebar behaviour, and layout preferences.',
    category: 'Settings',
    helpUrl: '/help/settings',
    owner: 'Intranet Team',
    updatedAt: '2026-01-12',
    contentType: 'Guide',
  },
  {
    id: 'personalisation',
    title: 'Personalising Your View',
    summary: 'Pin, hide, and reorder cards so your hubs stay focused.',
    category: 'Personalisation',
    helpUrl: '/help/personalisation',
    owner: 'Intranet Team',
    updatedAt: '2026-01-08',
    contentType: 'Checklist',
  },
  {
    id: 'search',
    title: 'Search Tips',
    summary: 'Find people, documents, and tools faster with smart search.',
    category: 'Search',
    helpUrl: '/help/search',
    owner: 'Digital Workplace',
    updatedAt: '2026-01-09',
    contentType: 'Guide',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Common Issues',
    summary: 'Quick fixes for access, loading, and browser issues.',
    category: 'Troubleshooting',
    helpUrl: '/help/troubleshooting',
    owner: 'IT Service Desk',
    updatedAt: '2026-01-11',
    contentType: 'Guide',
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    summary: 'Navigate the intranet faster with helpful shortcuts.',
    category: 'Shortcuts',
    helpUrl: '/help/shortcuts',
    owner: 'Digital Workplace',
    updatedAt: '2026-01-05',
    contentType: 'Guide',
  },
  {
    id: 'quick-reference',
    title: 'Quick Reference Sheets',
    summary: 'One-page reference cards for day-to-day intranet actions.',
    category: 'Shortcuts',
    helpUrl: '/help/quick-reference',
    owner: 'Digital Workplace',
    updatedAt: '2026-01-18',
    contentType: 'Quick Reference',
  },
  {
    id: 'walkthroughs',
    title: 'Guided Walk-throughs',
    summary: 'Step-by-step walkthroughs for common intranet tasks.',
    category: 'Getting Started',
    helpUrl: '/help/walkthroughs',
    owner: 'Intranet Team',
    updatedAt: '2026-01-18',
    contentType: 'Walk-through',
  },
  {
    id: 'video-tutorials',
    title: 'Video Tutorials',
    summary: 'Short videos covering key tools and workflows.',
    category: 'Getting Started',
    helpUrl: '/help/videos',
    owner: 'Digital Workplace',
    updatedAt: '2026-01-18',
    contentType: 'Video',
  },
  {
    id: 'help-faqs',
    title: 'Help Centre FAQs',
    summary: 'Answers to the most common questions about the intranet.',
    category: 'Support',
    helpUrl: '/help/faqs',
    owner: 'Intranet Team',
    updatedAt: '2026-01-18',
    contentType: 'FAQ',
  },
  {
    id: 'policy-basics',
    title: 'Policy & Compliance Basics',
    summary: 'Key policies, approvals, and compliance steps to keep in mind.',
    category: 'Compliance',
    helpUrl: '/help/policies',
    owner: 'Governance',
    updatedAt: '2026-01-18',
    contentType: 'Policy',
  },
];

const tasksGuideMarkdown = `# Tasks – User Guide

This guide is for anyone using Tasks for the first time. It covers how to find Tasks, create and manage items, and understand notifications.

## Overview

Tasks help you track work you own or have been assigned. You can:
- Create tasks with a title, priority, due date, and optional checklist.
- Assign ownership and add additional assignees.
- Track progress, mark tasks complete, and add comments.
- Receive overdue and due‑today notifications in the notifications bell and Status Bar.

## Where to find Tasks

### 1) From the top navigation bar
1. Select the **Tasks** icon (clipboard) in the navbar.
2. The Tasks panel opens as a slide‑out panel.

> [!suggestion] What you should see
> - A panel titled **My Tasks**.
> - Tabs for **All**, **Pending**, **Completed**, and **Overdue** (if any overdue tasks exist).
> - A search bar plus **Priority** and **Hub** filters.
> - A **New Task** button and a **Refresh** button.

### 2) From the My Tasks widget (Home dashboard)
1. Open the **My Tasks** widget on the Home dashboard.
2. Select **View all** or the **Add** button.

> [!suggestion] What you should see
> - The same Tasks panel as above.

## Creating a task (full editor)

1. Open the Tasks panel.
2. Select **New Task**.
3. Fill in the form:
   - **Title** (required)
   - **Description** (optional)
   - **Status** (Not started, In progress, Completed, Cancelled)
   - **Priority** (Low, Medium, High, Urgent)
   - **Due date** (optional)
   - **Assign to** (owner type + owner ID)
   - **Additional assignees** (optional)
   - **Assign to hub** (optional)
   - **Checklist** items (optional)
   - **Notifications** (see Notifications section)
4. Select **Create**.

> [!suggestion] What you should see
> - The new task in the list with a status badge and priority indicator.
> - If a due date is set, a due date label appears.
> - If the task is linked to a hub, the hub label appears.

## Managing tasks

### Open task details
1. In the Tasks panel list, select any task.

> [!suggestion] What you should see
> - A task detail panel with the task title, status, due date, description (if provided), checklist, assignees, and comments.

### Edit a task
1. In the task detail panel, select **Edit task**.
2. Update fields and select **Save**.

> [!suggestion] What you should see
> - Updated task details in the list and detail view.

### Change status quickly
You can change status in two places:
- **Task detail panel**: use the **Change status** buttons.
- **My Tasks widget**: use the quick checkbox to toggle completion.

> [!suggestion] What you should see
> - Status badges update immediately.
> - Completed tasks move out of **Pending** and into **Completed**.

### Use the checklist
1. In the editor, add items in **Checklist**.
2. In the detail panel, tick items to mark them complete.

> [!suggestion] What you should see
> - Checklist progress appears on task cards and the My Tasks widget.

### Search and filter
1. Use the **Search tasks…** field to find tasks by title or hub.
2. Filter by **Priority** or **Hub**.
3. Use tabs to switch between **All**, **Pending**, **Completed**, and **Overdue**.

> [!suggestion] What you should see
> - The task list updates immediately based on your filters.
> - Tab counts reflect the number of tasks in each category.

## Notifications and reminders

Tasks integrate with the notification system in two ways: the notifications bell and the Status Bar.

### Notifications bell (navbar)
1. Select the **Notifications** bell icon.
2. Review grouped items (Overdue, Due today).
3. Select **Mark all as read** to clear unread badges.
4. Select **View All Tasks** to open the Tasks panel.

> [!suggestion] What you should see
> - A flyout grouped by category with due date context (e.g., “Due today”, “2 days overdue”).
> - Unread items display a dot until marked read.

### Status Bar task banner
When you have overdue or due‑today tasks, the Status Bar shows a banner.

1. Hover to see a tooltip summary.
2. Select the banner to open Tasks.
3. Select **Dismiss** to hide the banner for now (and mark banner items as read).

> [!suggestion] What you should see
> - A banner message like **“You have 2 overdue and 1 due today task”**.
> - A tooltip listing the top tasks with due‑date hints.

### Notification settings on a task
Each task includes notification controls in the editor:
- **Do not notify me about this task** toggle.
- **Email reminder** dropdown (disabled if notifications are turned off).

> [!suggestion] What you should see
> - Turning on **Do not notify** disables email reminder selection.
> - Email reminder options include common offsets (e.g., 1 hour before, 1 day before).

## Troubleshooting

- **I can’t find a task:** Clear filters and switch to **All**.
- **No notifications are showing:** Ensure the task has a due date and notifications are enabled.
- **Email reminder is disabled:** Turn off **Do not notify me about this task**.

## Tips

- Use **Pending** to stay on top of active work.
- Use **Overdue** to triage urgent items quickly.
- Add a checklist for multi‑step work to visualise progress.
`;

const draftReviewCss = `body.markdown-preview-view {
  font-family: "Segoe UI", Arial, sans-serif;
  line-height: 1.6;
  background: #ffffff;
  color: #0a1627;
}
.markdown-preview-view .markdown-rendered {
  width: 75%;
  margin: 0 auto;
}
/* Headings */
.markdown-preview-view h1,
.markdown-preview-view h2,
.markdown-preview-view h3 {
  font-weight: 700;
  letter-spacing: 0.04em;
}
.markdown-preview-view h1 {
  color: #ffffff;
  background: #001CAD;
  border-left: 5px solid #001CAD;
  border-bottom: none;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 6px 20px rgba(10, 22, 39, 0.5);
}
.markdown-preview-view h2 {
  color: #f4f8ff !important;
  background: #001CAD;
  border-left: 5px solid #001CAD;
  border-radius: 8px;
  padding: 0.65rem 1rem;
  margin-top: 2.8rem;
  box-shadow: 0 4px 14px rgba(22, 34, 46, 0.35);
}
.markdown-preview-view h3 {
  color: #001CAD;
  background: #EEF2F8;
  border-left: 5px solid #EEF2F8;
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  margin-top: 2.4rem;
}
.markdown-preview-view h4 {
  color: #3cbecb;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
/* Blockquotes */
.markdown-preview-view blockquote {
  margin: 0.3rem 0 1.2rem 0;
  padding: 0.3rem 0.9rem;
  border-left: 4px solid #3b7dd8 !important;
  background: #203f66 !important;
  color: #f2f6ff !important;
  box-shadow: 0 6px 18px rgba(12, 26, 44, 0.35);
  border-radius: 8px;
}
/* Blockquote as caption (following a table) */
.markdown-preview-view table + blockquote,
.markdown-preview-view table + p + blockquote {
  margin-top: 0.3rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.9em;
}
/* Tables */
.markdown-preview-view table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.5rem 0 0.3rem 0;
  border-radius: 8px;
  overflow: hidden;
}
.markdown-preview-view table thead tr th,
.markdown-preview-view table tr:first-of-type th {
  background: #3f5ba9 !important;
  color: #ffffff !important;
}
.markdown-preview-view table thead tr th:first-child {
  border-top-left-radius: 8px;
}
.markdown-preview-view table thead tr th:last-child {
  border-top-right-radius: 8px;
}
.markdown-preview-view table th {
  background: #3f5ba9;
  color: #ffffff;
  text-align: left;
  padding: 0.6rem;
}
.markdown-preview-view table tbody td {
  padding: 0.6rem;
  border-top: 1px solid #c9d9f2;
}
.markdown-preview-view table tbody tr:nth-child(odd) {
  background: #e8eef8;
}
.markdown-preview-view table tbody tr:nth-child(even) {
  background: #d4dfef;
}
/* Code */
.markdown-preview-view code {
  background: #e3e7ef;
  color: #25324a;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}
.markdown-preview-view pre {
  background: #dde2eb;
  border: 1px solid #c3cbd9;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
/* Callouts */
/* Purpose */
.markdown-preview-view .callout[data-callout="purpose"] {
  background: #dff4ff;
  color: #0a1627;
  border-left: 5px solid #5ab0e6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.markdown-preview-view .callout[data-callout="purpose"] .callout-title {
  color: #0a1627;
  font-weight: 700;
  letter-spacing: 0.02em;
}
/* Note & Info */
.markdown-preview-view .callout[data-callout="note"],
.markdown-preview-view .callout[data-callout="info"] {
  background: #dbe7ff;
  color: #0a1a2f;
  border-left: 5px solid #4f7fce;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.markdown-preview-view .callout[data-callout="note"] .callout-title,
.markdown-preview-view .callout[data-callout="info"] .callout-title {
  color: #0a1a2f;
  font-weight: 700;
  letter-spacing: 0.02em;
}
/* Caution */
.markdown-preview-view .callout[data-callout="caution"] {
  background: #fbe9d2;
  color: #1b1b1b;
  border-left: 5px solid #f4a261;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.markdown-preview-view .callout[data-callout="caution"] .callout-title {
  color: #1b1b1b;
  font-weight: 700;
}
/* SUGGESTION (Corrected) */
.markdown-preview-view .callout[data-callout="suggestion"] {
  background: #F6F6F6;
  color: #2f2608;
  border-left: 5px solid #EEF2F8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-style: normal;
}
.markdown-preview-view .callout[data-callout="suggestion"] .callout-title {
  color: #001CAD;
  font-weight: normal;
  font-style: normal;
  font-size: 1rem;
  letter-spacing: 0;
  margin-bottom: 0.25rem;
}
.markdown-preview-view .callout[data-callout="suggestion"] p {
  margin: 0.25rem 0 0 0;
  padding: 0;
  line-height: 1.5;
}
.markdown-preview-view .callout[data-callout="suggestion"] .callout-icon {
  display: none;
}
/* Ultimate fix: force white h2 text across all rendering contexts */
.markdown-preview-view h2,
.markdown-preview-view .markdown-preview-section h2,
.markdown-preview-view .markdown-rendered h2,
.markdown-preview-view h2 span {
  color: #ffffff !important;
}
`;

const renderMarkdownWithCallouts = (markdown: string): string => {
  const lines = markdown.split('\n');
  const output: string[] = [];
  let inCallout = false;
  let calloutType = '';
  let calloutTitle = '';
  let calloutLines: string[] = [];

  const flushCallout = (): void => {
    if (!inCallout) return;
    const contentMarkdown = calloutLines.join('\n');
    const contentHtml = marked.parse(contentMarkdown) as string;
    output.push(
      `<div class="callout" data-callout="${calloutType}">` +
        `<div class="callout-title">${calloutTitle || calloutType}</div>` +
        `<div class="callout-content">${contentHtml}</div>` +
      `</div>`
    );
    inCallout = false;
    calloutType = '';
    calloutTitle = '';
    calloutLines = [];
  };

  lines.forEach((line) => {
    const calloutMatch = line.match(/^> \[!(\w+)\]\s*(.*)$/);
    if (calloutMatch) {
      flushCallout();
      inCallout = true;
      calloutType = calloutMatch[1].toLowerCase();
      calloutTitle = calloutMatch[2] || calloutMatch[1];
      return;
    }

    if (inCallout) {
      if (line.startsWith('>')) {
        calloutLines.push(line.replace(/^>\s?/, ''));
        return;
      }
      flushCallout();
    }

    output.push(line);
  });

  flushCallout();

  return marked.parse(output.join('\n')) as string;
};
export const HelpCenter: React.FC<IHelpCenterProps> = ({ cards, onClose }) => {
  const theme = useTheme();
  const [searchText, setSearchText] = React.useState('');
  const [appliedQuery, setAppliedQuery] = React.useState('');
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: MessageBarType } | null>(null);
  const audit = useAudit();

  // Auto-dismiss toast after 3 seconds
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toastMessage]);

  // Feedback panel state
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = React.useState(false);

  const handleOpenFeedback = (): void => {
    audit.logUserInteraction('feedback_form_opened', {
      metadata: { source: 'help_center_cta' },
    });
    setIsFeedbackPanelOpen(true);
  };

  const generalButtons = [
    'Getting Started',
    'Settings',
    'Personalisation',
    'Search',
    'Troubleshooting',
    'Shortcuts',
    'Support',
    'Compliance',
  ];
  const [selectedGeneralCategory, setSelectedGeneralCategory] = React.useState(
    generalButtons[0]
  );
  const [selectedContentTypes, setSelectedContentTypes] = React.useState<string[]>([]);
  const contentTypeOptions = [
    { key: 'Guide', text: 'Guides' },
    { key: 'Checklist', text: 'Checklists' },
    { key: 'Wizard', text: 'Wizards' },
    { key: 'Walk-through', text: 'Walk-throughs' },
    { key: 'Video', text: 'Videos' },
    { key: 'FAQ', text: 'FAQs' },
    { key: 'Policy', text: 'Policies' },
    { key: 'Quick Reference', text: 'Quick reference' },
  ];
  const [expandedGroup, setExpandedGroup] = React.useState<'general' | 'hub' | 'whatsNew' | null>(null);
  const hubKeys = React.useMemo(() => {
    const unique = Array.from(new Set(cards.map((card) => card.hubKey)));
    return unique;
  }, [cards]);
  const [selectedHubKey, setSelectedHubKey] = React.useState<string | null>(
    hubKeys[0] || null
  );

  React.useEffect(() => {
    if (!selectedHubKey || hubKeys.indexOf(selectedHubKey) === -1) {
      setSelectedHubKey(hubKeys[0] || null);
    }
  }, [hubKeys, selectedHubKey]);

  const helpMetaByCardId = React.useMemo(() => {
    const meta: Record<string, { owner: string; updatedAt: string; contentType: string }> = {};
    cards.forEach((card) => {
      meta[card.id] = {
        owner: 'Intranet Team',
        updatedAt: '2026-01-12',
        contentType: 'Guide',
      };
    });
    return meta;
  }, [cards]);

  const filteredHubCards = React.useMemo(() => {
    const scopedCards = selectedHubKey
      ? cards.filter((card) => card.hubKey === selectedHubKey)
      : cards;
    const typeFilteredCards = selectedContentTypes.length === 0
      ? scopedCards
      : scopedCards.filter(
          (card) => selectedContentTypes.indexOf(helpMetaByCardId[card.id]?.contentType || '') !== -1
        );
    if (!appliedQuery.trim()) {
      return typeFilteredCards;
    }
    const lower = appliedQuery.toLowerCase();
    return typeFilteredCards.filter(
      (card) =>
        card.title.toLowerCase().includes(lower) ||
        card.description.toLowerCase().includes(lower)
    );
  }, [cards, appliedQuery, selectedHubKey, selectedContentTypes, helpMetaByCardId]);

  const filteredGeneralCards = React.useMemo(() => {
    const scopedCards = generalHelpCards.filter(
      (card) => card.category === selectedGeneralCategory
    );
    const typeFilteredCards = selectedContentTypes.length === 0
      ? scopedCards
      : scopedCards.filter((card) => selectedContentTypes.indexOf(card.contentType) !== -1);
    if (!appliedQuery.trim()) {
      return typeFilteredCards;
    }
    const lower = appliedQuery.toLowerCase();
    return typeFilteredCards.filter(
      (card) =>
        card.title.toLowerCase().includes(lower) ||
        card.summary.toLowerCase().includes(lower) ||
        card.owner.toLowerCase().includes(lower) ||
        card.contentType.toLowerCase().includes(lower)
    );
  }, [appliedQuery, selectedGeneralCategory, selectedContentTypes]);

  const handleFeedback = (label: string, isHelpful: boolean): void => {
    // Log feedback submission
    audit.logHelpSearch('feedback_submitted', {
      metadata: {
        articleTitle: label,
        isHelpful,
      },
    });

    window.dispatchEvent(
      new CustomEvent('helpFeedback', {
        detail: { label, isHelpful },
      })
    );
  };

  /** Print article content */
  const handlePrintArticle = (articleId: string, title: string): void => {
    audit.logHelpSearch('article_printed', {
      metadata: { articleId, title },
    });

    // Open print dialog - in production this would render styled article content
    const printContent = `
      <!doctype html>
      <html>
        <head>
          <title>${title} - DDRE Intranet Help</title>
          <style>
            @media print {
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; padding: 40px; }
              h1 { color: #001CAD; border-bottom: 2px solid #001CAD; padding-bottom: 8px; }
              .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
              .logo { font-weight: bold; color: #001CAD; }
              .date { color: #666; }
              @page { margin: 2cm; }
            }
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #001CAD; border-bottom: 2px solid #001CAD; padding-bottom: 8px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
            .logo { font-weight: bold; color: #001CAD; }
            .date { color: #666; }
            .placeholder { background: #f0f0f0; padding: 40px; text-align: center; color: #666; border-radius: 8px; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="logo">DDRE Intranet Help</span>
            <span class="date">${new Date().toLocaleDateString('en-AU')}</span>
          </div>
          <h1>${title}</h1>
          <div class="placeholder">
            <p>Article content would be rendered here in production.</p>
            <p>This is a print preview placeholder.</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  /** Copy article link to clipboard */
  const handleCopyLink = async (articleId: string, title: string, helpUrl?: string): Promise<void> => {
    const url = helpUrl ? `${window.location.origin}${helpUrl}` : `${window.location.origin}/help/${articleId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      audit.logHelpSearch('article_link_copied', {
        metadata: { articleId, title, url },
      });
      setToastMessage({ text: 'Link copied to clipboard', type: MessageBarType.success });
    } catch {
      setToastMessage({ text: 'Failed to copy link', type: MessageBarType.error });
    }
  };

  /** Download as PDF (mock - shows coming soon) */
  const handleDownloadPdf = (articleId: string, title: string): void => {
    audit.logHelpSearch('article_pdf_requested', {
      metadata: { articleId, title },
    });
    setToastMessage({ text: 'PDF download coming soon!', type: MessageBarType.info });
  };

  /** Source context for article opens */
  type ArticleSource = 'search' | 'category' | 'card' | 'request' | 'related';

  /** Get related articles for a given article ID */
  const getRelatedArticles = (articleId: string): IRelatedArticle[] => {
    return relatedArticlesMap[articleId] || [];
  };

  const handleOpenHelp = (
    title: string,
    summary: string,
    helpUrl?: string,
    source?: ArticleSource,
    articleId?: string,
    sourceArticleId?: string // The article we clicked from (for related article tracking)
  ): void => {
    const resolvedArticleId = articleId ?? helpUrl ?? title;
    
    // Log article opened with source context
    if (source) {
      audit.logHelpSearch(source === 'related' ? 'related_article_clicked' : 'article_opened', {
        metadata: {
          articleId: resolvedArticleId,
          title,
          source,
          searchQuery: source === 'search' ? appliedQuery : undefined,
          sourceArticleId: source === 'related' ? sourceArticleId : undefined,
        },
      });
    }
    
    // Get related articles for this article
    const relatedArticles = getRelatedArticles(resolvedArticleId);
    
    openMockHelpWindow({ title, summary, helpUrl, relatedArticles });
  };

  const handleRequestHelp = (): void => {
    const selectedLabels = selectedContentTypes.length > 0
      ? selectedContentTypes.join(', ')
      : 'All categories';
    const hubLabel = selectedHubKey ? (hubInfo[selectedHubKey]?.title || selectedHubKey) : 'All hubs';
    const summaryParts = [`Categories: ${selectedLabels}`, `Hub: ${hubLabel}`];
    if (appliedQuery) {
      summaryParts.push(`Search term: "${appliedQuery}"`);
    }

    const params = new URLSearchParams();
    if (selectedContentTypes.length > 0) {
      params.set('types', selectedContentTypes.join(','));
    }
    if (selectedHubKey) {
      params.set('hub', selectedHubKey);
    }
    if (appliedQuery) {
      params.set('q', appliedQuery);
    }

    handleOpenHelp(
      'Request help',
      summaryParts.join(' • '),
      `/help/request-help${params.toString() ? `?${params.toString()}` : ''}`,
      'request'
    );
  };

  const handleSearch = (value?: string): void => {
    const rawQuery = (value || searchText || '').trim();
    setAppliedQuery(rawQuery);

    // Compute filtered results (simulate, as actual filtering logic is elsewhere)
    // For now, count all cards that match the query in title or description
    const lowerQuery = rawQuery.toLowerCase();
    const resultCount = rawQuery
      ? cards.filter(card =>
          card.title.toLowerCase().includes(lowerQuery) ||
          (card.description?.toLowerCase().includes(lowerQuery))
        ).length
      : cards.length;

    audit.logHelpSearch('search_executed', {
      metadata: {
        query: rawQuery,
        resultCount,
      },
    });

    // Log separately when no results found (for content gap analysis)
    if (rawQuery && resultCount === 0) {
      audit.logHelpSearch('search_no_results', {
        metadata: {
          query: rawQuery,
        },
      });
    }

    const selectedLabels = selectedContentTypes.length > 0
      ? selectedContentTypes.join(', ')
      : 'All categories';
    const summaryParts = [`Categories: ${selectedLabels}`];
    if (rawQuery) {
      summaryParts.push(`Search term: "${rawQuery}"`);
    }

    const params = new URLSearchParams();
    if (selectedContentTypes.length > 0) {
      params.set('types', selectedContentTypes.join(','));
    }
    if (rawQuery) {
      params.set('q', rawQuery);
    }

    handleOpenHelp(
      'Help search results',
      summaryParts.join(' • '),
      `/help/search${params.toString() ? `?${params.toString()}` : ''}`,
      'search'
    );
  };

  const toggleGroup = (group: 'general' | 'hub' | 'whatsNew'): void => {
    setExpandedGroup((prev) => (prev === group ? null : group));
  };

  const handleOpenTasksGuidePreview = React.useCallback(() => {
    const html = renderMarkdownWithCallouts(tasksGuideMarkdown);
    const previewHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tasks guide preview</title>
    <style>${draftReviewCss}</style>
  </head>
  <body class="markdown-preview-view">
    <div class="markdown-preview-view markdown-rendered">
      ${html}
    </div>
  </body>
</html>`;

    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  const helpCenterClassName = `${styles.helpCenter} ${theme.isInverted ? styles.dark : ''}`;

  return (
    <div className={helpCenterClassName}>
      {/* Toast notification */}
      {toastMessage && (
        <div className={styles.toast}>
          <MessageBar
            messageBarType={toastMessage.type}
            onDismiss={() => setToastMessage(null)}
            dismissButtonAriaLabel="Close"
          >
            {toastMessage.text}
          </MessageBar>
        </div>
      )}

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Help Centre</h1>
          <p className={styles.heroSubtitle}>
            Find answers, explore guides, and learn how to use DDRE’s intranet tools.
          </p>
        </div>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchField}>
          <SearchBox
            placeholder="Search help articles"
            value={searchText}
            onChange={(_, value) => setSearchText(value || '')}
            onSearch={handleSearch}
            onClear={() => {
              setSearchText('');
              setAppliedQuery('');
            }}
            styles={{ root: { width: '100%' } }}
          />
        </div>
        <div className={styles.filterField}>
          <Dropdown
            placeholder="Filter by category"
            options={contentTypeOptions}
            selectedKeys={selectedContentTypes}
            multiSelect
            onChange={(_, option) => {
              if (!option) {
                return;
              }
              const key = String(option.key);
              setSelectedContentTypes((prev) =>
                option.selected
                  ? [...prev, key]
                  : prev.filter((value) => value !== key)
              );
            }}
            styles={{ root: { width: '100%' } }}
          />
        </div>
      </div>

      <div className={styles.buttonGroups}>
        <div className={styles.buttonGroup}>
          <div className={styles.buttonGroupHeader}>
            <div className={styles.buttonGroupLabel}>General help</div>
            <button
              type="button"
              className={styles.buttonGroupToggle}
              onClick={() => toggleGroup('general')}
            >
              {expandedGroup === 'general' ? 'Hide cards' : 'Show cards'}
            </button>
          </div>
          <div className={styles.buttonRow}>
            {generalButtons.map((label) => (
              <button
                key={label}
                className={`${styles.categoryChip} ${selectedGeneralCategory === label ? styles.categoryChipActive : ''}`}
                type="button"
                onClick={() => {
                  setSelectedGeneralCategory(label);
                  setExpandedGroup('general');
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {expandedGroup === 'general' && (
            <div className={styles.articleGrid}>
              {filteredGeneralCards.map((card) => (
                <div key={card.id} className={styles.articleCard}>
                  <div className={styles.articleHeader}>
                    <Icon iconName="TextDocument" className={styles.articleIcon} />
                    <span className={styles.articleCategory}>{card.category}</span>
                    <span className={styles.articleType}>
                      {card.contentType === 'Video' ? (
                        <Icon iconName="Video" className={styles.articleTypeIcon} />
                      ) : (
                        card.contentType
                      )}
                    </span>
                  </div>
                  <h3 className={styles.articleTitle}>{card.title}</h3>
                  <p className={styles.articleSummary}>{card.summary}</p>
                  <div className={styles.articleMeta}>
                    <span>{card.owner}</span>
                    <span>Updated {card.updatedAt}</span>
                  </div>
                  <div className={styles.articleActions}>
                    <IconButton
                      iconProps={{ iconName: 'Print' }}
                      title="Print article"
                      ariaLabel="Print article"
                      className={styles.articleActionButton}
                      onClick={() => handlePrintArticle(card.id, card.title)}
                    />
                    <IconButton
                      iconProps={{ iconName: 'Link' }}
                      title="Copy link"
                      ariaLabel="Copy link"
                      className={styles.articleActionButton}
                      onClick={() => handleCopyLink(card.id, card.title, card.helpUrl)}
                    />
                    <IconButton
                      iconProps={{ iconName: 'PDF' }}
                      title="Download as PDF"
                      ariaLabel="Download as PDF"
                      className={styles.articleActionButton}
                      onClick={() => handleDownloadPdf(card.id, card.title)}
                    />
                  </div>
                  <button
                    className={styles.articleAction}
                    type="button"
                    onClick={() => handleOpenHelp(card.title, card.summary, card.helpUrl, 'category', card.id)}
                  >
                    Open help
                    <Icon iconName="ChevronRight" className={styles.articleChevron} />
                  </button>
                  <div className={styles.articleFeedback}>
                    <span>Was this helpful?</span>
                    <button
                      type="button"
                      className={styles.feedbackButton}
                      onClick={() => handleFeedback(card.title, true)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={styles.feedbackButton}
                      onClick={() => handleFeedback(card.title, false)}
                    >
                      No
                    </button>
                  </div>
                  {/* Related Articles Section */}
                  {relatedArticlesMap[card.id] && relatedArticlesMap[card.id].length > 0 && (
                    <div className={styles.relatedArticles}>
                      <div className={styles.relatedHeader}>
                        <Icon iconName="Link12" className={styles.relatedIcon} />
                        <span className={styles.relatedLabel}>See Also</span>
                      </div>
                      <div className={styles.relatedList}>
                        {relatedArticlesMap[card.id].map((related) => (
                          <button
                            key={related.articleId}
                            type="button"
                            className={styles.relatedLink}
                            onClick={() => {
                              const relatedCard = generalHelpCards.find(c => c.id === related.articleId);
                              if (relatedCard) {
                                handleOpenHelp(relatedCard.title, relatedCard.summary, relatedCard.helpUrl, 'related', related.articleId, card.id);
                              }
                            }}
                          >
                            <span className={styles.relatedType}>{related.relationshipType === 'prerequisite' ? '⬅️' : related.relationshipType === 'next_step' ? '➡️' : related.relationshipType === 'troubleshooting' ? '🔧' : '🔗'}</span>
                            {related.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.buttonGroup}>
          <div className={styles.buttonGroupHeader}>
            <div className={styles.buttonGroupLabel}>Help by hub</div>
            <button
              type="button"
              className={styles.buttonGroupToggle}
              onClick={() => toggleGroup('hub')}
            >
              {expandedGroup === 'hub' ? 'Hide cards' : 'Show cards'}
            </button>
          </div>
          <div className={styles.buttonRow}>
            {hubKeys.map((hubKey) => (
              <button
                key={hubKey}
                className={`${styles.categoryChip} ${selectedHubKey === hubKey ? styles.categoryChipActive : ''}`}
                type="button"
                onClick={() => {
                  setSelectedHubKey(hubKey);
                  setExpandedGroup('hub');
                }}
              >
                {hubInfo[hubKey]?.title || hubKey}
              </button>
            ))}
          </div>
          {expandedGroup === 'hub' && (
            <div className={styles.articleGrid}>
              {filteredHubCards.map((card) => (
                <div key={card.id} className={styles.articleCard}>
                  <div className={styles.articleHeader}>
                    <Icon iconName="TextDocument" className={styles.articleIcon} />
                    <span className={styles.articleCategory}>
                      {hubInfo[card.hubKey]?.title || card.hubKey}
                    </span>
                    <span className={styles.articleType}>
                      {helpMetaByCardId[card.id]?.contentType === 'Video' ? (
                        <Icon iconName="Video" className={styles.articleTypeIcon} />
                      ) : (
                        helpMetaByCardId[card.id]?.contentType
                      )}
                    </span>
                  </div>
                  <h3 className={styles.articleTitle}>{card.title}</h3>
                  <p className={styles.articleSummary}>{card.description}</p>
                  <div className={styles.articleMeta}>
                    <span>{helpMetaByCardId[card.id]?.owner}</span>
                    <span>Updated {helpMetaByCardId[card.id]?.updatedAt}</span>
                  </div>
                  <div className={styles.articleActions}>
                    <IconButton
                      iconProps={{ iconName: 'Print' }}
                      title="Print article"
                      ariaLabel="Print article"
                      className={styles.articleActionButton}
                      onClick={() => handlePrintArticle(card.id, card.title)}
                    />
                    <IconButton
                      iconProps={{ iconName: 'Link' }}
                      title="Copy link"
                      ariaLabel="Copy link"
                      className={styles.articleActionButton}
                      onClick={() => handleCopyLink(card.id, card.title, card.helpUrl)}
                    />
                    <IconButton
                      iconProps={{ iconName: 'PDF' }}
                      title="Download as PDF"
                      ariaLabel="Download as PDF"
                      className={styles.articleActionButton}
                      onClick={() => handleDownloadPdf(card.id, card.title)}
                    />
                  </div>
                  <button
                    className={styles.articleAction}
                    type="button"
                    onClick={() => handleOpenHelp(card.title, card.description, card.helpUrl, 'card', card.id)}
                    disabled={!card.helpUrl}
                  >
                    Open help
                    <Icon iconName="ChevronRight" className={styles.articleChevron} />
                  </button>
                  <div className={styles.articleFeedback}>
                    <span>Was this helpful?</span>
                    <button
                      type="button"
                      className={styles.feedbackButton}
                      onClick={() => handleFeedback(card.title, true)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={styles.feedbackButton}
                      onClick={() => handleFeedback(card.title, false)}
                    >
                      No
                    </button>
                  </div>
                  {/* Related Help for hub cards - link to general help */}
                  <div className={styles.relatedArticles}>
                    <div className={styles.relatedHeader}>
                      <Icon iconName="Link12" className={styles.relatedIcon} />
                      <span className={styles.relatedLabel}>Related Help</span>
                    </div>
                    <div className={styles.relatedList}>
                      <button
                        type="button"
                        className={styles.relatedLink}
                        onClick={() => {
                          const gettingStarted = generalHelpCards.find(c => c.id === 'getting-started');
                          if (gettingStarted) {
                            handleOpenHelp(gettingStarted.title, gettingStarted.summary, gettingStarted.helpUrl, 'related', 'getting-started', card.id);
                          }
                        }}
                      >
                        <span className={styles.relatedType}>⬅️</span>
                        Getting Started with the Intranet
                      </button>
                      <button
                        type="button"
                        className={styles.relatedLink}
                        onClick={() => {
                          const troubleshooting = generalHelpCards.find(c => c.id === 'troubleshooting');
                          if (troubleshooting) {
                            handleOpenHelp(troubleshooting.title, troubleshooting.summary, troubleshooting.helpUrl, 'related', 'troubleshooting', card.id);
                          }
                        }}
                      >
                        <span className={styles.relatedType}>🔧</span>
                        Troubleshooting Common Issues
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* What's New Section */}
        <div className={styles.buttonGroup}>
          <div className={styles.buttonGroupHeader}>
            <div className={styles.buttonGroupLabel}>
              <Icon iconName="Megaphone" className={styles.whatsNewIcon} />
              What&apos;s New
            </div>
            <button
              type="button"
              className={styles.buttonGroupToggle}
              onClick={() => toggleGroup('whatsNew')}
            >
              {expandedGroup === 'whatsNew' ? 'Hide' : 'Show'}
            </button>
          </div>
          {expandedGroup === 'whatsNew' && (
            <div className={styles.whatsNewContainer}>
              <WhatsNew />
            </div>
          )}
        </div>
      </div>

      <div className={styles.ctaPanel}>
        <div>
          <h2 className={styles.ctaTitle}>Still need help?</h2>
          <p className={styles.ctaText}>
            We can connect you with the right team or help you report a problem.
          </p>
        </div>
        <div className={styles.ctaActions}>
          <DefaultButton
            text="Preview Tasks guide"
            iconProps={{ iconName: 'OpenInNewWindow' }}
            className={styles.ctaButton}
            onClick={handleOpenTasksGuidePreview}
          />
          <DefaultButton
            text="Request help"
            iconProps={{ iconName: 'Lightbulb' }}
            className={styles.ctaButton}
            onClick={handleRequestHelp}
          />
          <PrimaryButton
            text="Send Feedback"
            iconProps={{ iconName: 'Feedback' }}
            className={styles.ctaButtonPrimary}
            onClick={handleOpenFeedback}
          />
        </div>
      </div>

      {/* Feedback Panel */}
      <FeedbackPanel
        isOpen={isFeedbackPanelOpen}
        onDismiss={() => setIsFeedbackPanelOpen(false)}
        sourceContext="help_center"
      />
    </div>
  );
};

export default HelpCenter;
