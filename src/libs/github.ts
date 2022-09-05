import { type User } from '@octokit/graphql-schema'

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

    if (paginatedRepos.nodes) {
      for (const node of paginatedRepos.nodes) {
        if (node) {
          repos.push(node)
        }
      }
    }

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
    query Repos($after: String) {
      viewer {
        repositories(
          after: $after,
          first: 10,
          isFork: false,
          orderBy: { direction: DESC, field: STARGAZERS },
          ownerAffiliations: [OWNER],
          privacy: PUBLIC) {
            nodes {
              id
              name
            }
            pageInfo {
              hasNextPage
              endCursor
            }
        }
      }
    }`,
    variables: {
      after: after,
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

interface GitHubApiRequestBody {
  query: string
  variables?: Record<string, string | undefined>
}

type GitHubProfile = Pick<User, 'login'>
export type GitHubRepo = Pick<NonNullable<NonNullable<User['repositories']['nodes']>[number]>, 'id' | 'name'>
