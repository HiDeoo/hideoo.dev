import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'

import { getUnoCSSConfiguration } from './src/libs/unocss'

export default defineConfig({
  integrations: [UnoCSS(getUnoCSSConfiguration())],
  site: 'https://hideoo.dev',
})
