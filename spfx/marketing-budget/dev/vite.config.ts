import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, '../src/webparts/marketingBudget/components'),
      '@models': path.resolve(__dirname, '../src/models'),
      '@services': path.resolve(__dirname, '../src/services'),
      // Force bare imports from parent ../src/ files to resolve from dev harness node_modules
      // (parent node_modules may be incomplete when only the dev harness is installed)
      'dexie': path.resolve(__dirname, 'node_modules/dexie'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      '@fluentui/react': path.resolve(__dirname, 'node_modules/@fluentui/react'),
    },
  },
  server: {
    port: 3028,
    open: false,
    headers: {
      // Allow iframe embedding from SPFx workbench
      'X-Frame-Options': 'ALLOWALL',
    },
  },
  // Skip source maps during dependency pre-bundling to avoid truncated .map files
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false,
    },
  },
});
