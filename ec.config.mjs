import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { defineEcConfig } from 'astro-expressive-code'

export default defineEcConfig({
  plugins: [pluginCollapsibleSections()],
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
  useStyleReset: false,
})
