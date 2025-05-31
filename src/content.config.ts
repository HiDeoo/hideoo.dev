import { file, glob } from 'astro/loaders'
import { defineCollection, reference, z } from 'astro:content'

import { gitHubRecentContributionsLoader, gitHubRecentReposLoader, gitHubReposLoader } from '@libs/loaders'

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    description: z.string(),
    publishDate: z.date(),
    title: z.string(),
    updateDate: z.date().optional(),
    notebook: z
      .object({
        name: reference('notebooks'),
        section: z.string().optional(),
        order: z.number().optional(),
      })
      .optional(),
  }),
})

const notebooks = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/notebooks' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
})

const projects = defineCollection({
  loader: file('src/content/projects.yml'),
  schema: z.object({
    id: z.string(),
    repos: z.array(z.string()),
  }),
})

const recentContributions = defineCollection({
  loader: gitHubRecentContributionsLoader(),
})

const recentRepos = defineCollection({
  loader: gitHubRecentReposLoader(),
})

const repos = defineCollection({
  loader: gitHubReposLoader(),
})

export const collections = { notes, notebooks, projects, recentContributions, recentRepos, repos }
