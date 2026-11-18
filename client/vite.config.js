// Vite config: lets Vite understand React (JSX) files.
// The proxy sends any /api request from the React app (port 5173) to the Express server (port 3000).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
