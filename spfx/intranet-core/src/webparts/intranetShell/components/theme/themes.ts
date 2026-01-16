import { createTheme, ITheme } from '@fluentui/react';
import type { ThemeMode } from '../UserProfileMenu';

/**
 * Light theme definition
 */
export const lightTheme: ITheme = createTheme({
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

/**
 * Dark theme definition
 */
export const darkTheme: ITheme = createTheme({
  palette: {
    themePrimary: '#3aa0f3',
    themeLighterAlt: '#020609',
    themeLighter: '#091823',
    themeLight: '#102d43',
    themeTertiary: '#1f5a86',
    themeSecondary: '#2d84c5',
    themeDarkAlt: '#4daaf5',
    themeDark: '#6ab8f7',
    themeDarker: '#93ccf9',
    neutralLighterAlt: '#1c1c1c',
    neutralLighter: '#252525',
    neutralLight: '#343434',
    neutralQuaternaryAlt: '#3d3d3d',
    neutralQuaternary: '#454545',
    neutralTertiaryAlt: '#656565',
    neutralTertiary: '#c8c8c8',
    neutralSecondary: '#d0d0d0',
    neutralPrimaryAlt: '#dadada',
    neutralPrimary: '#ffffff',
    neutralDark: '#f4f4f4',
    black: '#f8f8f8',
    white: '#141414',
  },
  isInverted: true,
});

/**
 * Get the resolved theme based on user preference
 */
export const getResolvedTheme = (themeMode: ThemeMode): ITheme => {
  if (themeMode === 'system') {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? darkTheme : lightTheme;
  }
  return themeMode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Check if theme is dark
 */
export const isDarkTheme = (themeMode: ThemeMode): boolean => {
  if (themeMode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return themeMode === 'dark';
};

/**
 * CSS custom properties for theme - applied to :root or shell container
 * These supplement Fluent UI's theme for custom styling
 */
export const getThemeCssVars = (theme: ITheme): Record<string, string> => {
  const p = theme.palette;
  return {
    '--themePrimary': p.themePrimary,
    '--themeLighterAlt': p.themeLighterAlt,
    '--themeLighter': p.themeLighter,
    '--themeLight': p.themeLight,
    '--themeTertiary': p.themeTertiary,
    '--themeSecondary': p.themeSecondary,
    '--themeDarkAlt': p.themeDarkAlt,
    '--themeDark': p.themeDark,
    '--themeDarker': p.themeDarker,
    '--neutralLighterAlt': p.neutralLighterAlt,
    '--neutralLighter': p.neutralLighter,
    '--neutralLight': p.neutralLight,
    '--neutralQuaternaryAlt': p.neutralQuaternaryAlt,
    '--neutralQuaternary': p.neutralQuaternary,
    '--neutralTertiaryAlt': p.neutralTertiaryAlt,
    '--neutralTertiary': p.neutralTertiary,
    '--neutralSecondary': p.neutralSecondary,
    '--neutralPrimaryAlt': p.neutralPrimaryAlt,
    '--neutralPrimary': p.neutralPrimary,
    '--neutralDark': p.neutralDark,
    '--black': p.black,
    '--white': p.white,
  };
};
