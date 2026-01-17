import * as React from 'react';
import { DefaultButton, Icon, SearchBox } from '@fluentui/react';
import styles from './HelpCenter.module.scss';

export interface IHelpArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
}

export interface IHelpCenterProps {
  onClose?: () => void;
}

const helpArticles: IHelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with the Intranet',
    summary: 'Learn how to navigate hubs, find tools, and personalize your home view.',
    category: 'Getting Started',
  },
  {
    id: 'navigation',
    title: 'Navigation & Hubs',
    summary: 'Understand the sidebar, hubs, and how cards are organized.',
    category: 'Core Use',
  },
  {
    id: 'personalization',
    title: 'Personalising Your View',
    summary: 'Pin, hide, and reorder cards; set your theme and layout preferences.',
    category: 'Personalisation',
  },
  {
    id: 'search',
    title: 'Search Tips',
    summary: 'Use search effectively to locate people, files, and intranet resources.',
    category: 'Core Use',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Common Issues',
    summary: 'Connectivity, permissions, and browser tips for resolving issues fast.',
    category: 'Troubleshooting',
  },
  {
    id: 'apps',
    title: 'Using Business Apps',
    summary: 'Guidance for embedded tools and app entry points from the intranet.',
    category: 'Apps',
  },
];

const categories = [
  'Getting Started',
  'Core Use',
  'Personalisation',
  'Apps',
  'Troubleshooting',
];

export const HelpCenter: React.FC<IHelpCenterProps> = ({ onClose }) => {
  const [query, setQuery] = React.useState('');

  const filteredArticles = React.useMemo(() => {
    if (!query.trim()) {
      return helpArticles;
    }
    const lower = query.toLowerCase();
    return helpArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(lower) ||
        article.summary.toLowerCase().includes(lower) ||
        article.category.toLowerCase().includes(lower)
    );
  }, [query]);

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

      <div className={styles.categoryRow}>
        {categories.map((category) => (
          <span key={category} className={styles.categoryChip}>
            {category}
          </span>
        ))}
      </div>

      <div className={styles.articleGrid}>
        {filteredArticles.map((article) => (
          <div key={article.id} className={styles.articleCard}>
            <div className={styles.articleHeader}>
              <Icon iconName="TextDocument" className={styles.articleIcon} />
              <span className={styles.articleCategory}>{article.category}</span>
            </div>
            <h3 className={styles.articleTitle}>{article.title}</h3>
            <p className={styles.articleSummary}>{article.summary}</p>
            <button className={styles.articleAction} type="button">
              Read article
              <Icon iconName="ChevronRight" className={styles.articleChevron} />
            </button>
          </div>
        ))}
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
