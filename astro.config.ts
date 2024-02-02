import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
import { astroExpressiveCode } from 'astro-expressive-code'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkDirective from 'remark-directive'

import { remarkAdmonitions } from './src/libs/remark'

export default defineConfig({
  integrations: [
    astroExpressiveCode({
      styleOverrides: {
        borderColor: 'var(--color-gray-800)',
        borderRadius: 'var(--rounded)',
        borderWidth: 'var(--size-px)',
        codeFontFamily: 'var(--font-mono)',
        codeLineHeight: '1.6',
        focusBorder: 'var(--color-text-highlight)',
        frames: {
          editorActiveTabIndicatorHeight: '2px',
          editorTabBarBackground: 'var(--color-black)',
          frameBoxShadowCssValue: 'none',
          inlineButtonBackground: 'var(--color-gray-400)',
          inlineButtonBorder: 'var(--color-white)',
          terminalTitlebarBackground: 'var(--color-black)',
        },
        textMarkers: {
          markBackground: 'var(--color-bg-code-block-marker)',
          markBorderColor: 'var(--color-gray-500)',
        },
        uiFontFamily: 'var(--font-sans)',
        uiFontSize: 'var(--text-sm)',
        uiPaddingBlock: 'var(--size-1)',
        uiPaddingInline: 'var(--size-3)',
      },
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      themes: ['vitesse-dark', 'vitesse-light'],
      useDarkModeMediaQuery: false,
    }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    rehypePlugins: [rehypeHeadingIds, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
    remarkPlugins: [remarkDirective, remarkAdmonitions],
    syntaxHighlight: false,
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
  site: 'https://hideoo.dev',
})
