import { type User } from '@octokit/graphql-schema'

export async function fetchGitHubInfos() {
  const response = await fetch('https://api.github.com/graphql', {
    headers: {
      Authorization: `bearer ${import.meta.env.GH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
      query Infos {
        viewer {
          login
        }
      }`,
    }),
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText} while fetching GitHub infos.`)
  }

  const json = (await response.json()) as { data: { viewer: User } }

  return json.data.viewer
}
