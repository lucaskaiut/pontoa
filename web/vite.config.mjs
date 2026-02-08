import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function removeUseClientDirective() {
  return {
    name: 'remove-use-client-directive',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('node_modules') && id.includes('@tanstack/react-query')) {
        const cleanedCode = code
          .replace(/['"]use client['"];?\s*/g, '')
          .replace(/['"]use server['"];?\s*/g, '')
          .replace(/^['"]use client['"];?\s*$/gm, '')
          .replace(/^['"]use server['"];?\s*$/gm, '');

        if (cleanedCode !== code) {
          return {
            code: cleanedCode,
            map: null,
          };
        }
      }
      return null;
    },
  };
}

export default defineConfig(({ mode }) => {
  const isDebug = mode === 'development';

  return {
    plugins: [react(), tailwindcss(), removeUseClientDirective()],
    server: {
      host: true,
      port: 3000,
    },
    build: {
      minify: !isDebug ? 'esbuild' : false,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'query-vendor': ['@tanstack/react-query'],
          },
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return;
          }
          warn(warning);
        },
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    optimizeDeps: {
      include: ['@tanstack/react-query'],
      esbuildOptions: {
        logOverride: {
          'this-is-undefined-in-esm': 'silent',
        },
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(isDebug ? 'development' : 'production'),
      'process.env.DEBUG': JSON.stringify(isDebug ? 'true' : 'false'),
    },
    esbuild: {
      drop: isDebug ? [] : ['console', 'debugger'],
      legalComments: 'none',
    },
  };
});
