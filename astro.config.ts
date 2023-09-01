import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [sitemap()],
  scopedStyleStrategy: 'where',
  site: 'https://hideoo.dev',
})
