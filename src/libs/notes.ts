import { getCollection, type CollectionEntry } from 'astro:content'

export async function getNotes(count?: number) {
  const notes = await getCollection('notes')
  const sortedNotes = notes.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())

  if (count) {
    return sortedNotes.slice(0, count)
  }

  return sortedNotes
}

export function getNoteUrl(note: CollectionEntry<'notes'>) {
  return `/notes/${note.slug}`
}
