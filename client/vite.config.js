import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // ativa host em todas as interfaces
    port: 5173,       // porta padrão
  },
});


