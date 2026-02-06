/**
 * Standalone entry point for the Marketing Budget app.
 *
 * Opened when the user chooses "Open in new tab/window" from the shell.
 * Renders the same MarketingBudgetDevView (with its own sidebar) on
 * the same dev server — no second Vite instance needed.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@fluentui/react';
import MarketingBudget from '@mb-components/MarketingBudget';
import { DexieBudgetRepository } from '@mb-services/DexieBudgetRepository';

const repository = new DexieBudgetRepository();

const lightTheme = createTheme({
  palette: {
    themePrimary: '#0078d4',
    themeLighterAlt: '#eff6fc',
    themeLighter: '#deecf9',
    themeLight: '#c7e0f4',
    themeTertiary: '#71afe5',
    themeSecondary: '#2b88d8',
    themeDarkAlt: '#106ebe',
    themeDark: '#005a9e',
    themeDarker: '#004578',
    neutralLighterAlt: '#faf9f8',
    neutralLighter: '#f3f2f1',
    neutralLight: '#edebe9',
    neutralQuaternaryAlt: '#e1dfdd',
    neutralQuaternary: '#d0d0d0',
    neutralTertiaryAlt: '#c8c6c4',
    neutralTertiary: '#a19f9d',
    neutralSecondary: '#605e5c',
    neutralPrimaryAlt: '#3b3a39',
    neutralPrimary: '#323130',
    neutralDark: '#201f1e',
    black: '#000000',
    white: '#ffffff',
  },
});

const App: React.FC = () => (
  <ThemeProvider theme={lightTheme}>
    <MarketingBudget
      userDisplayName="Ken Boyle"
      isDarkTheme={false}
      isSharePointContext={false}
      repository={repository}
      userRole="admin" // Change to 'editor' or 'viewer' to test role-gating
    />
  </ThemeProvider>
);

ReactDOM.render(<App />, document.getElementById('root'));
