interface ImportMetaEnv {
  readonly GH_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace globalThis {
  var languageStats: import('./libs/github').LanguageStats
}
