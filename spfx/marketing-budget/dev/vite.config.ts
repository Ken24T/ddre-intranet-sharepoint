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
});
