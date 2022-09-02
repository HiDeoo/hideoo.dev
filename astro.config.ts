import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

const astroConfig = defineConfig({
  integrations: [tailwind()],
})

export default astroConfig
