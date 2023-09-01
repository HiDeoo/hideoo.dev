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

export const collections = { category, categories }
