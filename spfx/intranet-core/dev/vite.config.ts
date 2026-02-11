import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, '../src/webparts/intranetShell/components'),
      // Marketing Budget app sources (for single-port dev experience)
      '@mb-components': path.resolve(__dirname, '../../marketing-budget/src/webparts/marketingBudget/components'),
      '@mb-services': path.resolve(__dirname, '../../marketing-budget/src/services'),
      '@mb-models': path.resolve(__dirname, '../../marketing-budget/src/models'),
      '@mb-appbridge': path.resolve(__dirname, '../../marketing-budget/src/appBridge'),
      // Resolve dnd-kit from dev/node_modules
      '@dnd-kit/core': path.resolve(__dirname, 'node_modules/@dnd-kit/core'),
      '@dnd-kit/sortable': path.resolve(__dirname, 'node_modules/@dnd-kit/sortable'),
      '@dnd-kit/utilities': path.resolve(__dirname, 'node_modules/@dnd-kit/utilities'),
      // Force bare imports from marketing-budget sources to resolve from dev/node_modules
      // (those files live outside the project root, so Vite can't find them automatically)
      'dexie': path.resolve(__dirname, 'node_modules/dexie'),
    },
  },
  server: {
    port: 3027,
    open: true,
  },
});
