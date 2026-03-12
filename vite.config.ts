import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Nie wstrzykuj żadnych kluczy API do frontendu – tylko VITE_* z .env
// są dostępne w przeglądarce przez import.meta.env.
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
