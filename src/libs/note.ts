import { getCollection, type CollectionEntry } from 'astro:content'

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const datetimeFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' })

export async function getNotes(count?: number): Promise<Note[]> {
  const notes = await getCollection('notes')
  const sortedNotes = notes
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
    .map((aNote) => {
      const note: Note = {
        ...aNote,
        href: `/notes/${aNote.slug}`,
        publishDate: dateFormat.format(aNote.data.publishDate),
        publishDatetime: datetimeFormat.format(aNote.data.publishDate),
      }

      if (aNote.data.updateDate) {
        note.updateDate = dateFormat.format(aNote.data.updateDate)
        note.updateDatetime = datetimeFormat.format(aNote.data.updateDate)
      }

      return note
    })

  if (count) {
    return sortedNotes.slice(0, count)
  }

  return sortedNotes
}

export type Note = CollectionEntry<'notes'> & {
  href: string
  publishDate: string
  publishDatetime: string
  updateDate?: string
  updateDatetime?: string
}
