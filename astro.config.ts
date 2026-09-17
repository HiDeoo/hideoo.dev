import { satteri, satteriHeadingIdsPlugin } from '@astrojs/markdown-satteri'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
import { astroExpressiveCode } from 'astro-expressive-code'

import { admonitions, headingLinks } from './src/libs/satteri'

export default defineConfig({
  integrations: [astroExpressiveCode(), mdx(), sitemap()],
  markdown: {
    processor: satteri({
      features: { directive: true },
      mdastPlugins: [admonitions],
      hastPlugins: [() => satteriHeadingIdsPlugin(), headingLinks],
    }),
    syntaxHighlight: false,
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
  site: 'https://hideoo.dev',
})
