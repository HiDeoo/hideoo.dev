import { file, glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

import { gitHubRecentContributionsLoader, gitHubRecentReposLoader, gitHubReposLoader } from '@libs/loaders'

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    description: z.string(),
    publishDate: z.date(),
    title: z.string(),
    updateDate: z.date().optional(),
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

export const collections = { notes, projects, recentContributions, recentRepos, repos }
