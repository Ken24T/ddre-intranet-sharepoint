import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, '../src/webparts/intranetShell/components'),
      // Marketing Budget app sources (consolidated into intranet-core)
      '@mb-components': path.resolve(__dirname, '../src/webparts/marketingBudget/components'),
      '@mb-services': path.resolve(__dirname, '../src/webparts/marketingBudget/services'),
      '@mb-models': path.resolve(__dirname, '../src/webparts/marketingBudget/models'),
      // Resolve dnd-kit from dev/node_modules
      '@dnd-kit/core': path.resolve(__dirname, 'node_modules/@dnd-kit/core'),
      '@dnd-kit/sortable': path.resolve(__dirname, 'node_modules/@dnd-kit/sortable'),
      '@dnd-kit/utilities': path.resolve(__dirname, 'node_modules/@dnd-kit/utilities'),
      // Force bare imports to resolve from dev/node_modules
      // (source files live outside the dev project root)
      'dexie': path.resolve(__dirname, 'node_modules/dexie'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3027,
    open: true,
    fs: {
      // Allow serving files from the intranet-core source tree
      allow: [
        path.resolve(__dirname, '..'),
      ],
    },
  },
});
