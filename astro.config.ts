import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
import { astroExpressiveCode } from 'astro-expressive-code'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

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
          editorTabBarBackground: 'var(--color-black)',
          frameBoxShadowCssValue: 'none',
          inlineButtonBackground: 'var(--color-gray-400)',
          inlineButtonBorder: 'var(--color-white)',
          terminalTitlebarBackground: 'var(--color-black)',
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
    sitemap(),
  ],
  markdown: {
    rehypePlugins: [rehypeHeadingIds, [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { tabIndex: -1 } }]],
    syntaxHighlight: false,
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
  site: 'https://hideoo.dev',
})
