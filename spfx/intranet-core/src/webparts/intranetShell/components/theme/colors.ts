/**
 * DDRE Intranet Theme Colors
 * 
 * Official DDRE (Doug Disher Real Estate) brand colours.
 */

// Primary brand colors
export const brandColors = {
  primary: '#001CAD',       // DDRE Blue - main brand colour
  primaryDark: '#001589',   // Darker variant for hover states
  primaryLight: '#EEF2F8',  // Light Blue - backgrounds, panels
  eggshell: '#F6F6F6',      // Eggshell - page backgrounds, cards
  accent: '#001CAD',        // Accent color (same as primary)
};

// Hub-specific colors for hero banners
export const hubColors: Record<string, { gradient: string; accent: string }> = {
  help: {
    gradient: 'linear-gradient(135deg, #fff7cc 0%, #ffe08a 100%)',
    accent: '#c28a00',
  },
  home: {
    gradient: 'linear-gradient(135deg, #001CAD 0%, #001589 100%)',
    accent: '#001CAD',
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
  favourites: {
    gradient: 'linear-gradient(135deg, #8fd694 0%, #5abf73 100%)',
    accent: '#5abf73',
  },
};

// Semantic colors
export const semanticColors = {
  success: '#107c10',
  warning: '#ffb900',
  error: '#d13438',
  info: '#001CAD',        // DDRE Blue
};

// Neutral colors
export const neutralColors = {
  white: '#ffffff',
  lighterAlt: '#F6F6F6',  // Eggshell
  lighter: '#EEF2F8',     // Light Blue
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
