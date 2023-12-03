import { OGImageRoute } from 'astro-og-canvas'

import { getNotes } from '@libs/note'

const notes = await getNotes()
const pages: Record<string, OgPage> = Object.fromEntries(notes.map(({ data, href }) => [href.replace(/^\//, ''), data]))

pages['index'] = { title: "HiDeoo's projects and notes" }
pages['notes'] = { title: "HiDeoo's Personal Notes" }
pages['projects'] = { title: "HiDeoo's Open Source Portfolio" }

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
          weight: 'Normal',
        },
        title: {
          color: [250, 250, 250],
          families: ['Inter'],
          lineHeight: 1.2,
          weight: 'ExtraBold',
        },
      },
      fonts: [
        'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2',
        'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-800-normal.woff2',
      ],
      logo: {
        path: './src/images/og.png',
        size: [198, 31],
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
