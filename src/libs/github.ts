import type {
  CreatedPullRequestContribution,
  Maybe,
  PullRequestContributionsByRepository,
  Repository,
  User,
} from '@octokit/graphql-schema'

const repoBanList: RegExp[] = [/\.github/, /-repro/, /^edge-developer\.fr-FR$/, /-test$/]

const GithubRepoFragment = `fragment Repo on RepositoryConnection {
	nodes {
    description
    id
    name
    nameWithOwner
    stargazerCount
    url
  }
}`

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

  return getReposFromNodes(json.viewer.repositories.nodes).slice(0, count)
}

export async function fetchGitHubRecentContributions(count = 8) {
  const json = await fetchGitHubApi<{ viewer: Pick<User, 'contributionsCollection'> }>({
    query: `
    query {
      viewer {
        contributionsCollection {
          pullRequestContributionsByRepository(maxRepositories: 100) {
            repository {
              isFork
              name
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

  return normalizeContributions(json.viewer.contributionsCollection.pullRequestContributionsByRepository, count)
}

export async function fetchGitHubRepos() {
  const repos: GitHubRepo[] = []

  let hasMore = true
  let cursor: string | undefined

  while (hasMore) {
    const paginatedRepos = await fetchGitHubPaginatedRepos(cursor)

    repos.push(...getReposFromNodes(paginatedRepos.nodes))

    hasMore = paginatedRepos.pageInfo.hasNextPage

    if (hasMore && typeof paginatedRepos.pageInfo.endCursor === 'string') {
      cursor = paginatedRepos.pageInfo.endCursor
    }
  }

  return repos
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

function getReposFromNodes(nodes: Maybe<Maybe<Repository>[]> | undefined) {
  const repos: GitHubRepo[] = []

  if (!nodes) {
    return repos
  }

  for (const node of nodes) {
    if (!node || repoBanList.some((regex) => regex.test(node.name))) {
      continue
    }

    if (typeof node.description !== 'string' || node.description.length === 0) {
      console.error(`No description found for repository '${node.nameWithOwner}'.`)
      continue
    }

    repos.push({
      description: node.description,
      id: node.id,
      name: node.name,
      stars: node.stargazerCount,
      url: String(node.url),
    })
  }

  return repos
}

function normalizeContributions(
  rawContributions: PullRequestContributionsByRepository[],
  count: number,
): GitHubContribution[] {
  const sanitizedRawContributions: PullRequestContributionsByRepository[] = []

  for (const rawContribution of rawContributions) {
    if (
      rawContribution.repository.owner.login === 'HiDeoo' ||
      rawContribution.repository.isFork ||
      rawContribution.contributions.nodes?.length === 0 ||
      repoBanList.some((regex) => regex.test(rawContribution.repository.name))
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
    .slice(0, count)
}

interface GitHubApiRequestBody {
  query: string
  variables?: Record<string, string | number | undefined>
}

export interface GitHubRepo {
  description: string | null
  id: string
  name: string
  stars: number
  url: string
}

interface GitHubContribution {
  name: string
  url: string
}
