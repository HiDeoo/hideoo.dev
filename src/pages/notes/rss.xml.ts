import mdxRenderer from '@astrojs/mdx/server.js'
import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { render } from 'astro:content'
import { DOCTYPE_NODE, ELEMENT_NODE, TEXT_NODE, transform, walk, type Node } from 'ultrahtml'
import sanitize from 'ultrahtml/transformers/sanitize'

import { getNotes, type Note } from '@libs/note'

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('Missing site configuration to generate RSS feed.')
  }

  const notes = await getNotes(25)

  const container = await AstroContainer.create()
  container.addServerRenderer({ name: 'mdx', renderer: mdxRenderer })

  return rss({
    customData: `<language>en-us</language>`,
    description: 'Guides, code, and thoughts from my personal journey.',
    items: await Promise.all(
      notes.map(async (note) => ({
        content: await getRSSContent(note, site, container),
        description: note.data.description,
        link: note.href,
        pubDate: note.data.publishDate,
        title: note.data.title,
      })),
    ),
    site,
    title: "HiDeoo's Personal Notes",
  })
}

async function getRSSContent(note: Note, baseURL: URL, container: AstroContainer): Promise<string> {
  const { Content } = await render(note)
  const html = await container.renderToString(Content)

  const content = await transform(html, [
    async (node) => {
      // Thanks @delucis - https://github.com/delucis/astro-blog-full-text-rss/blob/204be3d5b84357d9a8e6b73ee751766b76ad727e/src/pages/rss.xml.ts
      // Thanks @Princesseuh - https://github.com/Princesseuh/erika.florist/blob/90d0063b3524b27aae193aff768db12709be0d05/src/middleware.ts
      await walk(node, (node) => {
        // Remove doctype preamble.
        if (node.type === DOCTYPE_NODE) {
          removeHTMLNode(node)
        } else if (node.type === ELEMENT_NODE) {
          // Transform link with relative path to absolute URL.
          if (node.name === 'a' && node.attributes['href']?.startsWith('/')) {
            node.attributes['href'] = stripTrailingSlash(baseURL.href) + node.attributes['href']
          }
          // Transform image with relative path to absolute URL.
          if (node.name === 'img' && node.attributes['src']?.startsWith('/')) {
            node.attributes['src'] = stripTrailingSlash(baseURL.href) + node.attributes['src']
          }
          // Remove Expressive Code copy button.
          if ('data-code' in node.attributes) {
            removeHTMLNode(node)
          }
        }
      })

      return node
    },
    sanitize({
      dropAttributes: {
        class: ['*'],
        'data-astro-source-file': ['*'],
        'data-astro-source-loc': ['*'],
        'data-language': ['*'],
        style: ['*'],
      },
      dropElements: ['link', 'script', 'style'],
    }),
  ])

  // Strips empty attributes with no name if any.
  return content.replaceAll(/\s=""\s/g, ' ')
}

function removeHTMLNode(node: Node) {
  node.type = TEXT_NODE
  node.value = ''
}

export function stripTrailingSlash(path: string) {
  if (!path.endsWith('/')) return path
  return path.slice(0, -1)
}
