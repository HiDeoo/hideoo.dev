interface ImportMetaEnv {
  readonly GH_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

type Theme = 'light' | 'dark'

interface DOMStringMap {
  navigationMenuExpanded?: string
  theme: Theme
  transitionDisabled?: string
}

declare const ThemeProvider: {
  updateTheme: (theme: Theme) => void
}
