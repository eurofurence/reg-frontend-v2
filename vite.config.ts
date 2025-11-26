import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tanstackRouter({ autoCodeSplitting: true }), viteReact(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8000,
    // This proxy is only used for development purposes
    proxy: {
      '/authsrv': {
        target: 'https://regtest.eurofurence.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/authsrv/, '/test-a56k-dev/authsrv'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Forward cookies from the original request
            const cookies = req.headers.cookie
            if (cookies) {
              proxyReq.setHeader('Cookie', cookies)
            }
          })
          proxy.on('proxyRes', (proxyRes, _req, res) => {
            // Rewrite Set-Cookie headers to work with localhost
            const setCookieHeaders = proxyRes.headers['set-cookie']
            if (setCookieHeaders) {
              const rewritten = setCookieHeaders.map((cookie) => {
                return cookie
                  .replace(/Domain=[^;]+/gi, '')
                  .replace(/Secure/gi, '')
                  .replace(/SameSite=None/gi, 'SameSite=Lax')
              })
              res.setHeader('Set-Cookie', rewritten)
            }
          })
        },
      },
      '/attsrv': {
        target: 'https://regtest.eurofurence.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          // Rewrite /attsrv/api/rest/v1/... to /test-a56k-dev/attsrv/api/rest/v1/...
          return path.replace(/^\/attsrv/, '/test-a56k-dev/attsrv')
        },
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const cookies = req.headers.cookie
            if (cookies) {
              proxyReq.setHeader('Cookie', cookies)
            }
          })
          proxy.on('proxyRes', (proxyRes, _req, res) => {
            const setCookieHeaders = proxyRes.headers['set-cookie']
            if (setCookieHeaders) {
              const rewritten = setCookieHeaders.map((cookie) => {
                return cookie
                  .replace(/Domain=[^;]+/gi, '')
                  .replace(/Secure/gi, '')
                  .replace(/SameSite=None/gi, 'SameSite=Lax')
              })
              res.setHeader('Set-Cookie', rewritten)
            }
          })
        },
      },
      '/paysrv': {
        target: 'https://regtest.eurofurence.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/paysrv/, '/test-a56k-dev/paysrv'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const cookies = req.headers.cookie
            if (cookies) {
              proxyReq.setHeader('Cookie', cookies)
            }
          })
          proxy.on('proxyRes', (proxyRes, _req, res) => {
            const setCookieHeaders = proxyRes.headers['set-cookie']
            if (setCookieHeaders) {
              const rewritten = setCookieHeaders.map((cookie) => {
                return cookie
                  .replace(/Domain=[^;]+/gi, '')
                  .replace(/Secure/gi, '')
                  .replace(/SameSite=None/gi, 'SameSite=Lax')
              })
              res.setHeader('Set-Cookie', rewritten)
            }
          })
        },
      },
    },
  },
})
