import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import { parse, serialize } from 'tinyduration'

import { formatDateMeta, type Meta } from '@libs/meta'
import { getNotes, type Note } from '@libs/note'

export async function getNotebooks(): Promise<Notebook[]> {
  const rawNotebooks = await getCollection('notebooks')

  const notebooks = await Promise.all(
    rawNotebooks.map(async (aNotebook) => {
      const notes = await getNotebookNotes(aNotebook.id)
      if (notes.length === 0) throw new Error(`Notebook ${aNotebook.id} has no notes.`)

      let readingTimeMinutes = 0
      let publishDate: Date | undefined
      let updateDate: Date | undefined

      for (const note of notes) {
        const minutes = parse(note.readingDatetime).minutes
        if (!minutes) throw new Error(`Note ${note.id} has no reading time.`)

        readingTimeMinutes += minutes

        if (!publishDate || note.data.publishDate < publishDate) publishDate = note.data.publishDate
        if (note.data.updateDate && (!updateDate || note.data.updateDate > updateDate))
          updateDate = note.data.updateDate
      }

      if (!publishDate) throw new Error(`Notebook ${aNotebook.id} has no publish date.`)

      const pDate = formatDateMeta(publishDate)

      if (readingTimeMinutes > 60)
        throw new Error('Notebook reading time exceeds 60 minutes, which is not implemented yet.')

      const notebook: Notebook = {
        ...aNotebook,
        date: publishDate,
        href: getNotebookHref(aNotebook),
        notes,
        publishDate: pDate.date,
        publishDatetime: pDate.datetime,
        readingDatetime: serialize({ minutes: readingTimeMinutes }),
        readingTime: `${readingTimeMinutes}min`,
      }

      if (updateDate) {
        const uDate = formatDateMeta(updateDate)

        notebook.updateDate = uDate.date
        notebook.updateDatetime = uDate.datetime
      }

      return notebook
    }),
  )

  return notebooks.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export async function getNotebookSectionNotes(notebook: Notebook['id'], section?: string): Promise<Note[]> {
  let notes = await getNotebookNotes(notebook)

  if (section) {
    notes = notes.filter((note) => {
      return note.data.notebook?.section === section
    })
  }

  return notes.sort((a, b) => {
    const [aOrder, bOrder] = [getNotebookNoteOrder(a), getNotebookNoteOrder(b)]
    return aOrder === bOrder ? 0 : aOrder < bOrder ? -1 : 1
  })
}

export async function getNotebookInfos(note: Note) {
  if (!note.data.notebook) throw new Error(`Note '${note.id}' has no notebook.`)
  const notebook = await getEntry(note.data.notebook.name)

  return {
    href: getNotebookHref(notebook),
    title: notebook.data.title,
  }
}

async function getNotebookNotes(notebook: Notebook['id']): Promise<Note[]> {
  const notes = await getNotes()
  return notes.filter((note) => {
    return note.data.notebook?.name.id === notebook
  })
}

function getNotebookHref(notebook: CollectionEntry<'notebooks'>) {
  return `/notebooks/${notebook.id}`
}

function getNotebookNoteOrder(note: Note): number {
  return note.data.notebook?.order ?? Number.MAX_VALUE
}

export type Notebook = CollectionEntry<'notebooks'> &
  Meta & {
    date: Date
    href: string
    notes: Note[]
  }
