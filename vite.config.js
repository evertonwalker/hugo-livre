import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const API_ROUTES = {
  '/api/comments': 'api/comments.js',
}

const ENV_KEYS = [
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'RESET_TOKEN',
]

/**
 * Na Vercel os arquivos de /api viram Serverless Functions automaticamente.
 * Localmente, este plugin monta os mesmos handlers no servidor do Vite para
 * que `npm run dev` funcione de ponta a ponta.
 */
function devApi() {
  return {
    name: 'dev-api',

    config(_config, { mode }) {
      // Os handlers leem process.env; o Vite só popula import.meta.env.
      const env = loadEnv(mode, process.cwd(), '')
      for (const key of ENV_KEYS) {
        if (env[key] && !process.env[key]) process.env[key] = env[key]
      }
    },

    configureServer(server) {
      for (const [route, file] of Object.entries(API_ROUTES)) {
        const absolute = path.resolve(server.config.root, file)

        server.middlewares.use(route, async (req, res, next) => {
          try {
            // Query com o mtime invalida o cache de módulos do Node a cada edição.
            const version = fs.statSync(absolute).mtimeMs
            const module = await import(`${pathToFileURL(absolute).href}?v=${version}`)
            await module.default(req, res)
          } catch (error) {
            next(error)
          }
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
})
