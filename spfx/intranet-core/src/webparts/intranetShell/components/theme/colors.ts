/**
 * DDRE Intranet Theme Colors
 * 
 * TODO: Update these values when official brand colors are provided.
 * These are placeholder colors for development.
 */

// Primary brand colors (update these when you have official colors)
export const brandColors = {
  primary: '#0078d4',       // Main brand color
  primaryDark: '#005a9e',   // Darker variant
  primaryLight: '#c7e0f4',  // Lighter variant
  accent: '#00bcf2',        // Accent color
};

// Hub-specific colors for hero banners
export const hubColors: Record<string, { gradient: string; accent: string }> = {
  home: {
    gradient: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
    accent: '#0078d4',
  },
  library: {
    gradient: 'linear-gradient(135deg, #107c10 0%, #0b5c0b 100%)',
    accent: '#107c10',
  },
  administration: {
    gradient: 'linear-gradient(135deg, #5c2d91 0%, #3b1d5c 100%)',
    accent: '#5c2d91',
  },
  office: {
    gradient: 'linear-gradient(135deg, #008575 0%, #005a4e 100%)',
    accent: '#008575',
  },
  'property-management': {
    gradient: 'linear-gradient(135deg, #c239b3 0%, #8a1a7a 100%)',
    accent: '#c239b3',
  },
  sales: {
    gradient: 'linear-gradient(135deg, #ca5010 0%, #8e3a0b 100%)',
    accent: '#ca5010',
  },
};

// Semantic colors
export const semanticColors = {
  success: '#107c10',
  warning: '#ffb900',
  error: '#d13438',
  info: '#0078d4',
};

// Neutral colors
export const neutralColors = {
  white: '#ffffff',
  lighterAlt: '#faf9f8',
  lighter: '#f3f2f1',
  light: '#edebe9',
  quaternaryAlt: '#e1dfdd',
  quaternary: '#d0d0d0',
  tertiaryAlt: '#c8c6c4',
  tertiary: '#a19f9d',
  secondary: '#605e5c',
  primaryAlt: '#3b3a39',
  primary: '#323130',
  dark: '#201f1e',
  black: '#000000',
};

// Helper to get hub color with fallback
export const getHubColor = (hubKey: string): { gradient: string; accent: string } => {
  return hubColors[hubKey] || hubColors.home;
};
