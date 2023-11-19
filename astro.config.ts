import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
import { astroExpressiveCode } from 'astro-expressive-code'

export default defineConfig({
  integrations: [
    astroExpressiveCode({
      styleOverrides: {
        borderColor: 'var(--color-gray-800)',
        borderRadius: 'var(--rounded-base)',
        borderWidth: 'var(--size-px)',
        codeFontFamily: 'var(--font-mono)',
        codeLineHeight: '1.5',
        codePaddingBlock: 'var(--size-2)',
        codePaddingInline: 'var(--size-3)',
        focusBorder: 'var(--color-text-highlight)',
        frames: {
          editorTabBarBackground: 'var(--color-black)',
          frameBoxShadowCssValue: 'none',
          inlineButtonBackground: 'var(--color-gray-400)',
          inlineButtonBorder: 'var(--color-white)',
          terminalTitlebarBackground: 'var(--color-black)',
        },
        uiFontFamily: 'var(--font-base)',
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
    syntaxHighlight: false,
  },
  site: 'https://hideoo.dev',
})
