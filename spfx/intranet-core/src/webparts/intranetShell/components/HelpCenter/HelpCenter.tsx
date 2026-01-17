import * as React from 'react';
import { DefaultButton, Icon, SearchBox } from '@fluentui/react';
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
}

const generalHelpCards: IGeneralHelpCard[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with the Intranet',
    summary: 'Learn the basics of navigating hubs and finding your tools quickly.',
    category: 'Getting Started',
    helpUrl: '/help/getting-started',
  },
  {
    id: 'settings',
    title: 'Settings & Preferences',
    summary: 'Change your theme, sidebar behaviour, and layout preferences.',
    category: 'Settings',
    helpUrl: '/help/settings',
  },
  {
    id: 'personalisation',
    title: 'Personalising Your View',
    summary: 'Pin, hide, and reorder cards so your hubs stay focused.',
    category: 'Personalisation',
    helpUrl: '/help/personalisation',
  },
  {
    id: 'search',
    title: 'Search Tips',
    summary: 'Find people, documents, and tools faster with smart search.',
    category: 'Search',
    helpUrl: '/help/search',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Common Issues',
    summary: 'Quick fixes for access, loading, and browser issues.',
    category: 'Troubleshooting',
    helpUrl: '/help/troubleshooting',
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    summary: 'Navigate the intranet faster with helpful shortcuts.',
    category: 'Shortcuts',
    helpUrl: '/help/shortcuts',
  },
];
export const HelpCenter: React.FC<IHelpCenterProps> = ({ cards, onClose }) => {
  const [query, setQuery] = React.useState('');
  const generalButtons = [
    'Getting Started',
    'Settings',
    'Personalisation',
    'Search',
    'Troubleshooting',
    'Shortcuts',
  ];
  const [selectedGeneralCategory, setSelectedGeneralCategory] = React.useState(
    generalButtons[0]
  );
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

  const filteredHubCards = React.useMemo(() => {
    const scopedCards = selectedHubKey
      ? cards.filter((card) => card.hubKey === selectedHubKey)
      : cards;
    if (!query.trim()) {
      return scopedCards;
    }
    const lower = query.toLowerCase();
    return scopedCards.filter(
      (card) =>
        card.title.toLowerCase().includes(lower) ||
        card.description.toLowerCase().includes(lower)
    );
  }, [cards, query, selectedHubKey]);

  const filteredGeneralCards = React.useMemo(() => {
    const scopedCards = generalHelpCards.filter(
      (card) => card.category === selectedGeneralCategory
    );
    if (!query.trim()) {
      return scopedCards;
    }
    const lower = query.toLowerCase();
    return scopedCards.filter(
      (card) =>
        card.title.toLowerCase().includes(lower) ||
        card.summary.toLowerCase().includes(lower)
    );
  }, [query, selectedGeneralCategory]);

  const handleOpenHelp = (title: string, summary: string, helpUrl?: string): void => {
    openMockHelpWindow({ title, summary, helpUrl });
  };

  const toggleGroup = (group: 'general' | 'hub'): void => {
    setExpandedGroup((prev) => (prev === group ? null : group));
  };

  return (
    <div className={styles.helpCenter}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Help Centre</h1>
          <p className={styles.heroSubtitle}>
            Find answers, explore guides, and learn how to use DDRE’s intranet tools.
          </p>
        </div>
      </div>

      <div className={styles.searchRow}>
        <SearchBox
          placeholder="Search help articles"
          value={query}
          onChange={(_, value) => setQuery(value || '')}
          styles={{ root: { width: '100%' } }}
        />
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
                  </div>
                  <h3 className={styles.articleTitle}>{card.title}</h3>
                  <p className={styles.articleSummary}>{card.summary}</p>
                  <button
                    className={styles.articleAction}
                    type="button"
                    onClick={() => handleOpenHelp(card.title, card.summary, card.helpUrl)}
                  >
                    Open help
                    <Icon iconName="ChevronRight" className={styles.articleChevron} />
                  </button>
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
                  </div>
                  <h3 className={styles.articleTitle}>{card.title}</h3>
                  <p className={styles.articleSummary}>{card.description}</p>
                  <button
                    className={styles.articleAction}
                    type="button"
                    onClick={() => handleOpenHelp(card.title, card.description, card.helpUrl)}
                    disabled={!card.helpUrl}
                  >
                    Open help
                    <Icon iconName="ChevronRight" className={styles.articleChevron} />
                  </button>
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
        <DefaultButton text="Request help" iconProps={{ iconName: 'Help' }} />
      </div>
    </div>
  );
};

export default HelpCenter;
