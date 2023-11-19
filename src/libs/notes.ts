import { getCollection, type CollectionEntry } from 'astro:content'

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const datetimeFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' })

export async function getNotes(count?: number): Promise<Note[]> {
  const notes = await getCollection('notes')
  const sortedNotes = notes
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
    .map((note) => ({
      ...note,
      href: `/notes/${note.slug}`,
      publishDate: dateFormat.format(note.data.publishDate),
      publishDatetime: datetimeFormat.format(note.data.publishDate),
    }))

  if (count) {
    return sortedNotes.slice(0, count)
  }

  return sortedNotes
}

type Note = CollectionEntry<'notes'> & {
  href: string
  publishDate: string
  publishDatetime: string
}
