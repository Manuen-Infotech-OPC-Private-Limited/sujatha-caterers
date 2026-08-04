import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Third arg '' loads every var, not just VITE_-prefixed ones.
  const env = loadEnv(mode, process.cwd(), '');

  // CRA exposed all REACT_APP_* vars on process.env. Vite doesn't, so map them
  // explicitly — this keeps the existing call sites working without edits.
  const craEnv = Object.fromEntries(
    Object.keys(env)
      .filter((key) => key.startsWith('REACT_APP_'))
      .map((key) => [`process.env.${key}`, JSON.stringify(env[key])])
  );

  return {
    plugins: [react(), tailwindcss()],

    define: {
      ...craEnv,
      'process.env.NODE_ENV': JSON.stringify(mode),
    },

    // CRA allowed JSX inside .js files and 7 files still rely on it
    // (App.js, index.js, and the five context providers). Once those are
    // renamed to .jsx this block can go.
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: { loader: { '.js': 'jsx' } },
    },

    server: {
      port: 3000,
      open: true,
    },

    // Keep CRA's output dir so existing deploy config keeps working.
    build: {
      outDir: 'build',
      sourcemap: false,
    },
  };
});
