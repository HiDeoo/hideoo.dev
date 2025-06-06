import { OGImageRoute } from 'astro-og-canvas'

import { getNotes } from '@libs/note'
import { getNotebooks } from '@libs/notebook'

const notes = await getNotes()
const notebooks = await getNotebooks()
const pages: Record<string, OgPage> = Object.fromEntries(
  [...notes, ...notebooks].map(({ data, href }) => [href.replace(/^\//, ''), data]),
)

pages['index'] = { title: "HiDeoo's projects and notes", description: 'Mostly TypeScript, Astro, React and some Go.' }
pages['notes'] = {
  title: "HiDeoo's Personal Notes",
  description: 'Guides, code, and thoughts from my personal journey.',
}
pages['projects'] = { title: "HiDeoo's Open Source Portfolio", description: 'All my projects are available on GitHub.' }

export const { getStaticPaths, GET } = OGImageRoute({
  getImageOptions: (_, page: OgPage) => {
    const options: OGImageOptions = {
      bgGradient: [[11, 12, 14]],
      bgImage: {
        path: './src/images/og-bg.png',
      },
      border: {
        color: [11, 12, 14],
        side: 'inline-start',
        width: 20,
      },
      font: {
        description: {
          color: [213, 213, 216],
          families: ['Inter'],
          size: 36,
          weight: 'Normal',
        },
        title: {
          color: [250, 250, 250],
          families: ['Inter'],
          lineHeight: 1.2,
          size: 60,
          weight: 'ExtraBold',
        },
      },
      fonts: [
        'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2',
        'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-800-normal.woff2',
      ],
      logo: {
        path: './src/images/og.png',
        size: [265, 46],
      },
      title: page.title,
    }

    if (page.description) {
      options.description = page.description
    }

    return options
  },
  pages,
  param: 'slug',
})

interface OgPage {
  title: string
  description?: string
}

type OGImageOptions = Awaited<ReturnType<Parameters<typeof OGImageRoute>[0]['getImageOptions']>>
