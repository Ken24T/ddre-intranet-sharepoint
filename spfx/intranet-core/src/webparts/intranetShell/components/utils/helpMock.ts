/** Relationship type between articles */
export type RelationshipType = 'prerequisite' | 'next_step' | 'related_topic' | 'troubleshooting';

/** Related article entry */
export interface IRelatedArticle {
  articleId: string;
  title: string;
  relationshipType: RelationshipType;
  helpUrl?: string;
}

export interface IHelpMockContent {
  title: string;
  summary: string;
  helpUrl?: string;
  relatedArticles?: IRelatedArticle[];
  onRelatedArticleClick?: (articleId: string, title: string, relationshipType: RelationshipType) => void;
}

const escapeHtml = (value: string): string =>
  value.replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Get display label for relationship type */
const getRelationshipLabel = (type: RelationshipType): string => {
  switch (type) {
    case 'prerequisite': return 'Start here first';
    case 'next_step': return 'Next step';
    case 'related_topic': return 'Related';
    case 'troubleshooting': return 'Troubleshooting';
    default: return 'See also';
  }
};

/** Get icon for relationship type */
const getRelationshipIcon = (type: RelationshipType): string => {
  switch (type) {
    case 'prerequisite': return '⬅️';
    case 'next_step': return '➡️';
    case 'related_topic': return '🔗';
    case 'troubleshooting': return '🔧';
    default: return '📄';
  }
};

const buildMockHelpHtml = (content: IHelpMockContent): string => {
  const safeTitle = escapeHtml(content.title);
  const safeSummary = escapeHtml(content.summary);
  const safeHelpUrl = content.helpUrl ? escapeHtml(content.helpUrl) : undefined;
  const helpLinkHtml = safeHelpUrl
    ? `<p><strong>Planned article:</strong> <a href="${safeHelpUrl}">${safeHelpUrl}</a></p>`
    : '';

  // Build related articles section
  let relatedArticlesHtml = '';
  if (content.relatedArticles && content.relatedArticles.length > 0) {
    const relatedItems = content.relatedArticles.map(article => {
      const icon = getRelationshipIcon(article.relationshipType);
      const label = getRelationshipLabel(article.relationshipType);
      const safeArticleTitle = escapeHtml(article.title);
      return `<li class="related-item">
        <span class="related-icon">${icon}</span>
        <span class="related-label">${label}:</span>
        <a href="#" class="related-link" data-article-id="${escapeHtml(article.articleId)}" data-relationship="${article.relationshipType}">${safeArticleTitle}</a>
      </li>`;
    }).join('');

    relatedArticlesHtml = `
    <h2>See Also</h2>
    <ul class="related-articles">
      ${relatedItems}
    </ul>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle} – Help</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 24px; background: #f6f9f7; color: #323130; }
    .card { background: #fff; border: 1px solid #d8eadf; border-radius: 12px; padding: 24px; max-width: 720px; box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
    h1 { margin: 0 0 8px; font-size: 24px; }
    h2 { margin: 16px 0 8px; font-size: 16px; color: #2f6b3f; }
    p { margin: 0 0 12px; color: #605e5c; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #dff1e5; color: #2f6b3f; font-size: 12px; font-weight: 600; }
    ul { margin: 0 0 12px 18px; color: #605e5c; }
    .related-articles { list-style: none; margin: 0; padding: 0; }
    .related-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; margin: 4px 0; background: #f0f7f2; border-radius: 8px; }
    .related-icon { font-size: 14px; }
    .related-label { font-size: 12px; color: #666; min-width: 100px; }
    .related-link { color: #0078d4; text-decoration: none; font-weight: 500; }
    .related-link:hover { text-decoration: underline; }
    @media print {
      body { background: #fff; padding: 0; }
      .card { box-shadow: none; border: none; max-width: 100%; }
      .related-articles { display: none; }
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Mock Help</span>
    <h1>${safeTitle}</h1>
    <p>${safeSummary}</p>
    <h2>What does this do?</h2>
    <p>This is a placeholder help article for ${safeTitle}.</p>
    <h2>Quick steps</h2>
    <ul>
      <li>Open the tool or help card.</li>
      <li>Follow the on-screen prompts.</li>
      <li>Save or submit when complete.</li>
    </ul>
    ${helpLinkHtml}
    ${relatedArticlesHtml}
    <p>Detailed help content will be added in the Help Centre later.</p>
  </div>
</body>
</html>`;
};

export const openMockHelpWindow = (content: IHelpMockContent): void => {
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.open();
    newWindow.document.write(buildMockHelpHtml(content));
    newWindow.document.close();
  }
};
