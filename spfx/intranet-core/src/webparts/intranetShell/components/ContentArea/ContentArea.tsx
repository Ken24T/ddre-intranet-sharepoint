import * as React from 'react';
import styles from '../IntranetShell.module.scss';

export interface IContentAreaProps {
  children: React.ReactNode;
}

/**
 * ContentArea - Main fluid content region.
 * Contains the page content, card grid, etc.
 */
export const ContentArea: React.FC<IContentAreaProps> = ({ children }) => {
  return (
    <main className={styles.content} role="main">
      {children}
    </main>
  );
};
