import rss from '@astrojs/rss'
import { getNotes } from '@libs/note'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('Missing site configuration to generate RSS feed.')
  }

  const notes = await getNotes(25)

  return rss({
    customData: `<language>en-us</language>`,
    description: "HiDeoo's Personal Notes",
    items: notes.map((note) => ({
      description: note.data.description,
      link: note.href,
      pubDate: note.data.publishDate,
      title: note.data.title,
    })),
    site,
    title: 'HiDeoo',
  })
}
