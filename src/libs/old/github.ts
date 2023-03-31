import { type User, type LanguageEdge, type Maybe, type Repository } from '@octokit/graphql-schema'

import { getLanguageColors } from './color'

const repoBanList: RegExp[] = [/\.github/, /-repro/]

// TODO(HiDeoo)
const repoLanguageOverrides: Record<string, Maybe<DeepPartial<LanguageEdge>>[]> = {
  'HiDeoo/prettier-config': [{ node: { color: '#267CB9', name: 'JSON' } }],
  'HiDeoo/tsconfig': [{ node: { color: '#267CB9', name: 'JSON' } }],
}

const GithubRepoFragment = `fragment Repo on RepositoryConnection {
	nodes {
    description
    id
    languages(first: 10, orderBy: { direction: DESC, field: SIZE }) {
      edges {
        size
        node {
          color
          name
        }
      }
    }
    name
    nameWithOwner
    stargazerCount
    url
  }
}`

export async function fetchGitHubProfile() {
  const { viewer } = await fetchGitHubApi<{ viewer: GitHubProfile }>({
    query: `
    query Infos {
      viewer {
        login
      }
    }`,
  })

  return viewer
}

export async function fetchGitHubReposAndLanguageStats() {
  const rawLanguageStats: RawLanguageStats = {}
  const repos: GitHubRepo[] = []

  let hasMore = true
  let cursor: string | undefined

  while (hasMore) {
    const paginatedRepos = await fetchGitHubPaginatedRepos(cursor)

    repos.push(...getReposAndLanguageStatsFromNodes(paginatedRepos.nodes, rawLanguageStats))

    hasMore = paginatedRepos.pageInfo.hasNextPage

    if (hasMore && typeof paginatedRepos.pageInfo.endCursor === 'string') {
      cursor = paginatedRepos.pageInfo.endCursor
    }
  }

  return { languageStats: normalizeLanguageStats(rawLanguageStats), repos }
}

export async function fetchGitHubRecentRepos(count = 4) {
  const json = await fetchGitHubApi<{ viewer: Pick<User, 'repositories'> }>({
    query: `
    ${GithubRepoFragment}
    query Repos($count: Int) {
      viewer {
        repositories(
          first: $count,
          isFork: false,
          orderBy: { direction: DESC, field: CREATED_AT },
          ownerAffiliations: [OWNER],
          privacy: PUBLIC
        ) {
          ...Repo
        }
      }
    }`,
    variables: {
      count: count + 10,
    },
  })

  return getReposAndLanguageStatsFromNodes(json.viewer.repositories.nodes).slice(0, count)
}

async function fetchGitHubPaginatedRepos(after?: string) {
  const json = await fetchGitHubApi<{ viewer: Pick<User, 'repositories'> }>({
    query: `
    ${GithubRepoFragment}
    query Repos($after: String) {
      viewer {
        repositories(
          after: $after,
          first: 100,
          isFork: false,
          orderBy: { direction: DESC, field: STARGAZERS },
          ownerAffiliations: [OWNER],
          privacy: PUBLIC
        ) {
          ...Repo
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }`,
    variables: {
      after,
    },
  })

  return json.viewer.repositories
}

async function fetchGitHubApi<TData>(body: GitHubApiRequestBody) {
  const response = await fetch('https://api.github.com/graphql', {
    headers: {
      Authorization: `bearer ${import.meta.env.GH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText} while fetching GitHub API.`)
  }

  const json = (await response.json()) as { data: TData }

  return json.data
}

function getReposAndLanguageStatsFromNodes(
  nodes: Maybe<Maybe<Repository>[]> | undefined,
  rawLanguageStats: RawLanguageStats = {}
) {
  const repos: GitHubRepo[] = []

  if (nodes) {
    for (const node of nodes) {
      if (node && !repoBanList.some((regex) => regex.test(node.name))) {
        if (typeof node.description !== 'string' || node.description.length === 0) {
          console.error(`No description found for repository '${node.nameWithOwner}'.`)
          continue
        }

        const languageOverride = repoLanguageOverrides[node.nameWithOwner]

        if (node.languages?.edges && languageOverride) {
          // @ts-expect-error The override is only a partial language edge.
          node.languages.edges = languageOverride
        }

        if (node.languages?.edges === undefined || node.languages.edges?.length === 0) {
          console.error(`No languages found for repository '${node.nameWithOwner}'.`)
          continue
        }

        const languages: GitHubRepo['languages'] = []

        if (node.languages.edges) {
          for (const languageEdge of node.languages.edges) {
            if (!languageEdge?.node.color) {
              continue
            }

            const colors = getLanguageColors(languageEdge.node.color)

            if (typeof languageEdge.size === 'number') {
              rawLanguageStats[languageEdge.node.name] = {
                colors,
                name: languageEdge.node.name,
                size: (rawLanguageStats[languageEdge.node.name]?.size ?? 0) + languageEdge.size,
              }
            }

            languages.push({
              colors,
              name: languageEdge.node.name,
            })
          }
        }

        repos.push({
          description: node.description,
          id: node.id,
          languages,
          name: node.name,
          stars: node.stargazerCount,
          url: node.url,
        })
      }
    }
  }

  return repos
}

function normalizeLanguageStats(rawLanguageStats: RawLanguageStats): LanguageStats {
  let totalSize = 0

  for (const { size } of Object.values(rawLanguageStats)) {
    totalSize += size
  }

  for (const languageName in rawLanguageStats) {
    const languageStats = rawLanguageStats[languageName]

    if (!languageStats) {
      continue
    }

    let newSize = Math.trunc((100 * languageStats.size) / totalSize)

    if (newSize <= 10) {
      newSize += 2
    }

    rawLanguageStats[languageName] = { ...languageStats, size: newSize }
  }

  return Object.values(rawLanguageStats)
    .sort((statA, statB) => statB.size - statA.size)
    .slice(0, 8)
}

interface GitHubApiRequestBody {
  query: string
  variables?: Record<string, string | number | undefined>
}

type GitHubProfile = Pick<User, 'login'>

export interface GitHubRepo {
  description: string | null
  id: string
  languages: GitHubLanguage[]
  name: string
  stars: number
  url: string
}

export interface GitHubLanguage {
  colors: {
    dark: string
    light: string
  }
  name: string
}

export interface LanguageStat {
  colors: GitHubLanguage['colors']
  name: string
  size: number
}

type RawLanguageStats = Record<LanguageStat['name'], LanguageStat>
export type LanguageStats = LanguageStat[]

type DeepPartial<TType> = {
  [Tkey in keyof TType]?: TType[Tkey] extends object ? DeepPartial<TType[Tkey]> : TType[Tkey]
}
