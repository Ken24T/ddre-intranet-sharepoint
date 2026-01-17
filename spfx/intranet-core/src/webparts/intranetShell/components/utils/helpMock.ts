export interface IHelpMockContent {
  title: string;
  summary: string;
  helpUrl?: string;
}

const escapeHtml = (value: string): string =>
  value.replace(/</g, '&lt;').replace(/>/g, '&gt;');

const buildMockHelpHtml = (content: IHelpMockContent): string => {
  const safeTitle = escapeHtml(content.title);
  const safeSummary = escapeHtml(content.summary);
  const safeHelpUrl = content.helpUrl ? escapeHtml(content.helpUrl) : undefined;
  const helpLinkHtml = safeHelpUrl
    ? `<p><strong>Planned article:</strong> <a href="${safeHelpUrl}">${safeHelpUrl}</a></p>`
    : '';

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
