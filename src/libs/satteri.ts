import { defineHastPlugin, defineMdastPlugin } from 'satteri'

export const admonitions = defineMdastPlugin({
  name: 'admonitions',
  containerDirective(node, ctx) {
    if (node.name !== 'note') return

    let label = 'Note'
    let firstChild = node.children[0]

    if (firstChild?.type === 'paragraph' && firstChild.data?.directiveLabel) {
      label = ctx.textContent(firstChild)
      ctx.removeNode(firstChild)
      firstChild = node.children[1]
    }

    if (firstChild?.type !== 'paragraph') {
      throw new Error('The first child of an admonition must be a paragraph.')
    }

    ctx.setProperty(node, 'data', {
      ...node.data,
      hName: 'aside',
      hProperties: { className: ['admonition'] },
    })

    ctx.prependChild(firstChild, [
      {
        type: 'strong',
        children: [{ type: 'text', value: label }],
      },
      { type: 'text', value: ' — ' },
    ])
  },
})

export const headingLinks = defineHastPlugin({
  name: 'heading-links',
  element: {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    visit(node, ctx) {
      const id = node.properties.id

      if (typeof id !== 'string' || !id) return

      ctx.replaceNode(node, {
        ...node,
        children: [
          {
            type: 'element',
            tagName: 'a',
            properties: { href: `#${id}` },
            children: node.children,
          },
        ],
      })
    },
  },
})
