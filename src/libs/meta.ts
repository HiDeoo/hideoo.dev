const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const datetimeFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' })

export function formatDateMeta(date: Date): { date: string; datetime: string } {
  return {
    date: dateFormat.format(date),
    datetime: datetimeFormat.format(date),
  }
}

export interface Meta {
  publishDate: string
  publishDatetime: string
  readingDatetime: string
  readingTime: string
  updateDate?: string
  updateDatetime?: string
}
