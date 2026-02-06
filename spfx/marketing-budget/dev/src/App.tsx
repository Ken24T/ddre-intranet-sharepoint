import React from 'react';
import { ThemeProvider, createTheme } from '@fluentui/react';
import MarketingBudget from '@components/MarketingBudget';
import { DexieBudgetRepository } from '@services/DexieBudgetRepository';

// DDRE brand theme
const ddreTheme = createTheme({
  palette: {
    themePrimary: '#001CAD',
    themeLighterAlt: '#f0f1fb',
    themeLighter: '#c5c9f0',
    themeLight: '#979ee3',
    themeTertiary: '#4854c7',
    themeSecondary: '#1424ad',
    themeDarkAlt: '#00199c',
    themeDark: '#001584',
    themeDarker: '#001061',
    neutralLighterAlt: '#F6F6F6',
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

// A single repository instance for the dev harness
const repository = new DexieBudgetRepository();

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={ddreTheme}>
      <MarketingBudget
        userDisplayName="Ken Boyle"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repository}
        userRole="admin" // Change to 'editor' or 'viewer' to test role-gating
      />
    </ThemeProvider>
  );
};
