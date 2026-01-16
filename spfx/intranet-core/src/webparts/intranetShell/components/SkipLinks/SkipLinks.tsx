import * as React from 'react';
import styles from './SkipLinks.module.scss';

/**
 * SkipLinks - Accessibility skip navigation links.
 * 
 * These links are visually hidden until focused via keyboard,
 * allowing screen reader and keyboard users to skip repetitive
 * navigation and jump directly to main content.
 * 
 * @example
 * ```tsx
 * <SkipLinks />
 * <Navbar />
 * <Sidebar />
 * <main id="main-content">...</main>
 * ```
 */
export const SkipLinks: React.FC = () => {
  return (
    <div className={styles.skipLinks}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <a href="#sidebar-nav" className={styles.skipLink}>
        Skip to navigation
      </a>
    </div>
  );
};

export default SkipLinks;
