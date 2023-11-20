import { defineCollection, reference, z } from 'astro:content'

const category = defineCollection({
  schema: z.object({
    name: z.string(),
    repos: z.array(z.string()),
  }),
  type: 'data',
})

const categories = defineCollection({
  schema: z.array(reference('category')),
  type: 'data',
})

const notes = defineCollection({
  schema: z.object({
    description: z.string(),
    publishDate: z.date(),
    title: z.string(),
    updateDate: z.date().optional(),
  }),
  type: 'content',
})

export const collections = { category, categories, notes }
