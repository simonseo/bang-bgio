import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Listen on all network interfaces (0.0.0.0)
    strictPort: false, // Allow fallback to another port if 3000 is in use
  },
});
