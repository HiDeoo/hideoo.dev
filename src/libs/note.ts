import { getCollection, type CollectionEntry } from 'astro:content'
import readingTime from 'reading-time'
import { serialize } from 'tinyduration'

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const datetimeFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' })

export async function getNotes(count?: number): Promise<Note[]> {
  const rawNotes = await getCollection('notes')
  const sortedNotes = rawNotes.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
  const notes = sortedNotes.map((aNote, index) => {
    // Not using remark so we can use the reading time in the note list.
    let readingTimeMinutes = Math.floor(readingTime(aNote.body).minutes)

    if (readingTimeMinutes < 1) {
      readingTimeMinutes = 1
    }

    const note: Note = {
      ...aNote,
      href: getNoteHref(aNote),
      publishDate: dateFormat.format(aNote.data.publishDate),
      publishDatetime: datetimeFormat.format(aNote.data.publishDate),
      readingDatetime: serialize({ minutes: readingTimeMinutes }),
      readingTime: `${readingTimeMinutes}min`,
    }

    if (aNote.data.updateDate) {
      note.updateDate = dateFormat.format(aNote.data.updateDate)
      note.updateDatetime = datetimeFormat.format(aNote.data.updateDate)
    }

    const prevNote = sortedNotes[index + 1]

    if (prevNote) {
      note.next = {
        href: getNoteHref(prevNote),
        title: prevNote.data.title,
      }
    }

    const nextNote = sortedNotes[index - 1]

    if (nextNote) {
      note.prev = {
        href: getNoteHref(nextNote),
        title: nextNote.data.title,
      }
    }

    return note
  })

  if (count) {
    return notes.slice(0, count)
  }

  return notes
}

function getNoteHref(note: CollectionEntry<'notes'>) {
  return `/notes/${note.slug}`
}

export type Note = CollectionEntry<'notes'> & {
  href: string
  next?: PrevNextNote
  prev?: PrevNextNote
  publishDate: string
  publishDatetime: string
  readingDatetime: string
  readingTime: string
  updateDate?: string
  updateDatetime?: string
}

interface PrevNextNote {
  href: string
  title: string
}
