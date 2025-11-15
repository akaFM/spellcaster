import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const clientPath = __dirname;
const sharedPath = resolve(__dirname, '..', 'shared');

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // allow importing shared types from outside the client folder
      // while still letting vite serve files from the client root
      allow: [clientPath, sharedPath],
    },
  },
});

