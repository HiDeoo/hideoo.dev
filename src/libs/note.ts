import { getCollection, type CollectionEntry } from 'astro:content'
import readingTime from 'reading-time'
import type { Blog, BlogPosting, Person } from 'schema-dts'
import { serialize } from 'tinyduration'

import { formatDateMeta, type Meta } from '@libs/meta'

const schemaAuthor: Person = {
  '@type': 'Person',
  name: 'HiDeoo',
  url: 'https://hideoo.dev',
}

export async function getNotes(count?: number): Promise<Note[]> {
  const rawNotes = await getCollection('notes')
  const sortedNotes = rawNotes.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
  const notes = sortedNotes.map((aNote, index) => {
    if (!aNote.body) {
      throw new Error(`Note ${aNote.id} has no body.`)
    }

    // Not using remark so we can use the reading time in the note list.
    let readingTimeMinutes = Math.floor(readingTime(aNote.body).minutes)

    if (readingTimeMinutes < 1) {
      readingTimeMinutes = 1
    }

    const pDate = formatDateMeta(aNote.data.publishDate)

    const note: Note = {
      ...aNote,
      href: getNoteHref(aNote),
      publishDate: pDate.date,
      publishDatetime: pDate.datetime,
      readingDatetime: serialize({ minutes: readingTimeMinutes }),
      readingTime: `${readingTimeMinutes}min`,
    }

    if (aNote.data.updateDate) {
      const uDate = formatDateMeta(aNote.data.updateDate)

      note.updateDate = uDate.date
      note.updateDatetime = uDate.datetime
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

export function getNotesSchema(notes: Note[], site: URL | undefined): Blog {
  return {
    '@type': 'Blog',
    author: schemaAuthor,
    blogPost: notes.map((note) => getNoteSchema(note, site, false)),
  }
}

export function getNoteSchema(note: Note, site: URL | undefined, includeRef = true): BlogPosting {
  const schema: BlogPosting = {
    '@type': 'BlogPosting',
    author: schemaAuthor,
    dateCreated: note.data.publishDate.toISOString(),
    datePublished: note.data.publishDate.toISOString(),
    description: note.data.description,
    headline: note.data.title,
  }

  if (includeRef) {
    schema.mainEntityOfPage = {
      '@type': 'WebPage',
      '@id': new URL('/notes', site).toString(),
    }
  }

  if (note.data.updateDate) {
    schema.dateModified = note.data.updateDate.toISOString()
  }

  return schema
}

function getNoteHref(note: CollectionEntry<'notes'>) {
  return `/notes/${note.id}`
}

export type Note = CollectionEntry<'notes'> &
  Meta & {
    href: string
    next?: PrevNextNote
    prev?: PrevNextNote
  }

interface PrevNextNote {
  href: string
  title: string
}
