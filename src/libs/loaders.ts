import type { Loader } from 'astro/loaders'
import { z } from 'astro:content'

import { fetchGitHubRecentContributions, fetchGitHubRecentRepos, fetchGitHubRepos } from '@libs/github'

const contributionSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
})

const repoSchema = z.object({
  description: z.string().nullable(),
  id: z.string(),
  name: z.string(),
  stars: z.number(),
  url: z.string().url(),
})

export function gitHubRecentContributionsLoader(): Loader {
  return {
    name: 'github-recent-contributions-loader',
    load: createGitHubLoader(fetchGitHubRecentContributions),
    schema: () => contributionSchema,
  }
}

export function gitHubRecentReposLoader(): Loader {
  return {
    name: 'github-recent-repos-loader',
    load: createGitHubLoader(fetchGitHubRecentRepos),
    schema: () => repoSchema,
  }
}

export function gitHubReposLoader(): Loader {
  return {
    name: 'github-repos-loader',
    load: createGitHubLoader(fetchGitHubRepos),
    schema: () => repoSchema,
  }
}

function createGitHubLoader(fetchEntries: () => Promise<unknown[]>): Loader['load'] {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return async ({ parseData, store }) => {
    const entries = (await fetchEntries()) as GitHubLoaderEntry[]

    store.clear()

    for (const entry of entries) {
      const data = await parseData({ id: entry.id, data: entry })
      store.set({ id: entry.id, data })
    }
  }
}

interface GitHubLoaderEntry {
  id: string
  [key: string]: unknown
}
