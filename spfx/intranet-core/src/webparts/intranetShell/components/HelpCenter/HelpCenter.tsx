import * as React from 'react';
import { DefaultButton, Dropdown, Icon, SearchBox, useTheme } from '@fluentui/react';
import styles from './HelpCenter.module.scss';
import type { IFunctionCard } from '../FunctionCard';
import { hubInfo } from '../data';
import { openMockHelpWindow } from '../utils/helpMock';

export interface IHelpCenterProps {
  cards: IFunctionCard[];
  onClose?: () => void;
}

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
export const HelpCenter: React.FC<IHelpCenterProps> = ({ cards, onClose }) => {
  const theme = useTheme();
  const [searchText, setSearchText] = React.useState('');
  const [appliedQuery, setAppliedQuery] = React.useState('');
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
  const [expandedGroup, setExpandedGroup] = React.useState<'general' | 'hub' | null>(null);
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
    window.dispatchEvent(
      new CustomEvent('helpFeedback', {
        detail: { label, isHelpful },
      })
    );
  };

  const handleOpenHelp = (title: string, summary: string, helpUrl?: string): void => {
    openMockHelpWindow({ title, summary, helpUrl });
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
      `/help/request-help${params.toString() ? `?${params.toString()}` : ''}`
    );
  };

  const handleSearch = (value?: string): void => {
    const rawQuery = (value || searchText || '').trim();
    setAppliedQuery(rawQuery);

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
      `/help/search${params.toString() ? `?${params.toString()}` : ''}`
    );
  };

  const toggleGroup = (group: 'general' | 'hub'): void => {
    setExpandedGroup((prev) => (prev === group ? null : group));
  };

  const helpCenterClassName = `${styles.helpCenter} ${theme.isInverted ? styles.dark : ''}`;

  return (
    <div className={helpCenterClassName}>
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
                  <button
                    className={styles.articleAction}
                    type="button"
                    onClick={() => handleOpenHelp(card.title, card.summary, card.helpUrl)}
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
                  <button
                    className={styles.articleAction}
                    type="button"
                    onClick={() => handleOpenHelp(card.title, card.description, card.helpUrl)}
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
                </div>
              ))}
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
        <DefaultButton
          text="Request help"
          iconProps={{ iconName: 'Lightbulb' }}
          className={styles.ctaButton}
          onClick={handleRequestHelp}
        />
      </div>
    </div>
  );
};

export default HelpCenter;
