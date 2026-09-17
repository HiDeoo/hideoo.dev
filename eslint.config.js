import hideoo from '@hideoo/eslint-config'

export default hideoo([
  {
    files: ['src/components/ThemeProvider.astro/**'],
    rules: {
      'unicorn/no-global-object-property-assignment': 'off',
    },
  },
])
