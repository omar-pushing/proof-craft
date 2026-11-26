import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';

// Modes: default = production (code-split), preview = one self-contained HTML file,
// test = one IIFE bundle for headless smoke tests.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'preview' ? [viteSingleFile()] : [])],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    target: 'es2020',
    sourcemap: false,
    outDir: mode === 'test' ? 'dist-test' : 'dist',
    ...(mode === 'test' ? { rollupOptions: { output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'app.js' } }, cssCodeSplit: false } : {}),
  },
}));
