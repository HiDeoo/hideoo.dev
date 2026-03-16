import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'

import type { ContributionData, RepositoryData } from './loaders'

export async function getRecentRepos() {
  // https://github.com/withastro/astro/issues/15905
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const repos = (await getCollection('recentRepos')) as (Omit<CollectionEntry<'recentRepos'>, 'data'> & {
    data: RepositoryData
  })[]

  return repos.toSorted((a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime())
}

export async function getRepos() {
  // https://github.com/withastro/astro/issues/15905
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const repos = (await getCollection('repos')) as (Omit<CollectionEntry<'repos'>, 'data'> & {
    data: RepositoryData
  })[]

  return repos.toSorted(
    (a, b) => b.data.stars - a.data.stars || b.data.createdAt.getTime() - a.data.createdAt.getTime(),
  )
}

export async function getRecentContributions() {
  // https://github.com/withastro/astro/issues/15905
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const recentContributions = (await getCollection('recentContributions')) as (Omit<
    CollectionEntry<'recentContributions'>,
    'data'
  > & {
    data: ContributionData
  })[]

  return recentContributions.toSorted((a, b) => a.data.index - b.data.index)
}

export async function getProjectsCategories() {
  const categories = await getCollection('projects')

  return categories.toSorted((a, b) => a.data.position - b.data.position)
}
