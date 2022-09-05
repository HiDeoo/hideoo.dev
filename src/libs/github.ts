import { type User, type Maybe, type Repository } from '@octokit/graphql-schema'

const GithubRepoFragment = `fragment Repo on RepositoryConnection {
	nodes {
    id
    name
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
      count,
    },
  })

  return getReposFromNodes(json.viewer.repositories.nodes)
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

  if (nodes) {
    for (const node of nodes) {
      if (node) {
        repos.push(node)
      }
    }
  }

  return repos
}

interface GitHubApiRequestBody {
  query: string
  variables?: Record<string, string | number | undefined>
}

type GitHubProfile = Pick<User, 'login'>
export type GitHubRepo = Pick<NonNullable<NonNullable<User['repositories']['nodes']>[number]>, 'id' | 'name'>
