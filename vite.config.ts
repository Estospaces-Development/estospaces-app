import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0', // Allow external connections
      port: 5173,
      strictPort: false,
      hmr: {
        timeout: 30000,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
        // Proxy Supabase requests to bypass CORS
        '/supabase': {
          target: env.VITE_SUPABASE_URL || 'https://yydtsteyknbpfpxjtlxe.supabase.co',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/supabase/, ''),
          secure: true,
          timeout: 60000,
          proxyTimeout: 60000,
          xfwd: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      force: true,
    },
    assetsInclude: ['**/*.exr'],
  }
})
