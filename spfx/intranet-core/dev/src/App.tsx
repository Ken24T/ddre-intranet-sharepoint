import React from 'react';
import { ThemeProvider, createTheme } from '@fluentui/react';
import { IntranetShell } from '@components/IntranetShell';
import { IntranetShellWrapper } from '@components/IntranetShellWrapper';
import packageJson from '../../package.json';

// Mock SharePoint context for dev
const mockContext = {
  userDisplayName: 'Ken Boyle',
  userEmail: 'ken@disher.com.au',
  siteTitle: 'DDRE Intranet',
  isAdmin: false, // Set to true to test admin features (e.g., Hide Card)
};

const appVersion = packageJson.version || '0.0.0';

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

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <IntranetShellWrapper>
        <IntranetShell
          userDisplayName={mockContext.userDisplayName}
          userEmail={mockContext.userEmail}
          siteTitle={mockContext.siteTitle}
          appVersion={appVersion}
          isAdmin={mockContext.isAdmin}
        />
      </IntranetShellWrapper>
    </ThemeProvider>
  );
};
