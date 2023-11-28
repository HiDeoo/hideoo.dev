const baseConfig = require('@hideoo/prettier-config')

/**
 * @type {import('prettier').Config}
 */
const customPrettierConfig = {
  ...baseConfig,
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 80,
      },
    },
  ],
  plugins: ['prettier-plugin-astro'],
}

module.exports = customPrettierConfig
