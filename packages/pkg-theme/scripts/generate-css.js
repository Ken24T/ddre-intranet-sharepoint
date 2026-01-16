/**
 * Generate static CSS file from design tokens.
 * Run with: npm run generate:css
 */

const { generateStaticCSS } = require('../lib/css-variables');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'dist', 'theme.css');
const outputDir = path.dirname(outputPath);

// Ensure dist directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate and write CSS
const css = generateStaticCSS();
fs.writeFileSync(outputPath, css, 'utf-8');

console.log(`✓ Generated: ${outputPath}`);
console.log(`  Size: ${(css.length / 1024).toFixed(2)} KB`);
