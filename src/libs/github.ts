import type {
  CreatedPullRequestContribution,
  LanguageEdge,
  Maybe,
  PullRequestContributionsByRepository,
  Repository,
  User,
} from '@octokit/graphql-schema'

import { LANGUAGE_COLOR_OVERRIDES, getLanguageColor, getLanguageColorOverride } from '@libs/color'

const maxLanguageStats = 8
const maxContributions = 8

const repoBanList: RegExp[] = [/\.github/, /-repro/]

const repoLanguageOverrides: Record<string, Maybe<DeepPartial<LanguageEdge>>[]> = {
  'HiDeoo/prettier-config': [{ node: { color: LANGUAGE_COLOR_OVERRIDES['JSON'], name: 'JSON' } }],
  'HiDeoo/tsconfig': [{ node: { color: LANGUAGE_COLOR_OVERRIDES['JSON'], name: 'JSON' } }],
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

export async function fetchGitHubRecentContributions() {
  const json = await fetchGitHubApi<{ viewer: Pick<User, 'contributionsCollection'> }>({
    query: `
    query {
      viewer {
        contributionsCollection {
          pullRequestContributionsByRepository(maxRepositories: 100) {
            repository {
              isFork
              nameWithOwner
              owner {
                login
              }
              url
            }
            contributions(last: 1, orderBy:{direction:ASC}) {
              nodes {
                pullRequest {
                  createdAt
                }
              }
            }
          }
        }
      }
    }`,
  })

  return normalizeContributions(json.viewer.contributionsCollection.pullRequestContributionsByRepository)
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
  rawLanguageStats: RawLanguageStats = {},
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

            // In most projects, the shell language is only appearing due to pre-commit hooks so we can safely skip it.
            if (languageEdge.node.name === 'Shell' && languageEdge.size < 2000) {
              continue
            }

            const color = getLanguageColor(getLanguageColorOverride(languageEdge.node.name) ?? languageEdge.node.color)

            if (typeof languageEdge.size === 'number') {
              rawLanguageStats[languageEdge.node.name] = {
                color,
                name: languageEdge.node.name,
                size: (rawLanguageStats[languageEdge.node.name]?.size ?? 0) + languageEdge.size,
              }
            }

            languages.push({
              color,
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
          url: String(node.url),
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
    .slice(0, maxLanguageStats)
}

function normalizeContributions(rawContributions: PullRequestContributionsByRepository[]): GitHubContribution[] {
  const sanitizedRawContributions: PullRequestContributionsByRepository[] = []

  for (const rawContribution of rawContributions) {
    if (
      rawContribution.repository.owner.login === 'HiDeoo' ||
      rawContribution.repository.isFork ||
      rawContribution.contributions.nodes?.length === 0
    ) {
      continue
    }

    sanitizedRawContributions.push(rawContribution)
  }

  sanitizedRawContributions.sort((leftContribution, rightContribution) => {
    const leftPullRequest = leftContribution.contributions.nodes?.at(0) as CreatedPullRequestContribution
    const rightPullRequest = rightContribution.contributions.nodes?.at(0) as CreatedPullRequestContribution

    const leftContributionDate = new Date(leftPullRequest.pullRequest.createdAt as string)
    const rightContributionDate = new Date(rightPullRequest.pullRequest.createdAt as string)

    return rightContributionDate.getTime() - leftContributionDate.getTime()
  })

  return sanitizedRawContributions
    .map((rawContribution) => ({
      name: rawContribution.repository.nameWithOwner,
      url: String(rawContribution.repository.url),
    }))
    .slice(0, maxContributions)
}

interface GitHubApiRequestBody {
  query: string
  variables?: Record<string, string | number | undefined>
}

export interface GitHubRepo {
  description: string | null
  id: string
  languages: GitHubLanguage[]
  name: string
  stars: number
  url: string
}

interface GitHubContribution {
  name: string
  url: string
}

interface GitHubLanguage {
  color: string
  name: string
}

interface LanguageStat {
  color: GitHubLanguage['color']
  name: string
  size: number
}

type RawLanguageStats = Record<LanguageStat['name'], LanguageStat>
export type LanguageStats = LanguageStat[]

type DeepPartial<TType> = {
  [Tkey in keyof TType]?: TType[Tkey] extends object ? DeepPartial<TType[Tkey]> : TType[Tkey]
}
