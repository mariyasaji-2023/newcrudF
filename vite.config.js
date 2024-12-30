import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allows access from any device in the same network
    port: 5173,      // Ensures the port remains the same
 },
 build: {
  outDir: 'dist',  // Specifies the build output directory
  emptyOutDir: true, // Ensures clean builds
}
});