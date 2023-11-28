import type { RemarkPlugin } from '@astrojs/markdown-remark'
import { h, type Properties } from 'hastscript'
import type { Paragraph, PhrasingContent, Root, Text } from 'mdast'
import type { Node } from 'unist'
import { remove } from 'unist-util-remove'
import { visit } from 'unist-util-visit'

export function remarkAdmonitions(): RemarkPlugin {
  return function remarkAdmonitionTransformer(tree: Root) {
    visit(tree, (node, index, parent) => {
      if (!index || !parent || !isContainerDirective(node) || node.name !== 'note') {
        return
      }

      let label = 'Note'

      remove(node, (child) => {
        if (!isDirectiveLabel(child)) {
          return false
        }

        label = child.children[0].value

        return true
      })

      const [firstChild, ...otherChildren] = node.children

      if (!isParagraph(firstChild)) {
        throw new Error('The first child of an admonition must be a paragraph.')
      }

      parent.children[index] = createElement('aside', { class: 'admonition' }, [
        {
          ...firstChild,
          children: [createElement('strong', {}, [createText(label)]), createText(' — '), ...firstChild.children],
        },
        ...otherChildren,
      ])
    })
  }
}

function isContainerDirective(node: Node): node is ContainerDirective {
  return node.type === 'containerDirective'
}

function isDirectiveLabel(node: Node): node is DirectiveLabel {
  return node.data !== undefined && (node as DirectiveLabel).data.directiveLabel === true
}

function isParagraph(node: Node | undefined): node is Paragraph {
  return node?.type === 'paragraph'
}

function createElement(tag: string, attributes: Properties, children: unknown[]): Paragraph {
  const { tagName, properties } = h(tag, attributes)

  return {
    children: children as PhrasingContent[],
    data: {
      hName: tagName,
      hProperties: properties,
    },
    type: 'paragraph',
  }
}

function createText(text: string): Text {
  return { type: 'text', value: text }
}

interface ContainerDirective extends Node {
  children: Node[]
  name: string
}

interface DirectiveLabel extends ContainerDirective {
  name: string
  children: [Text]
  data: {
    directiveLabel: boolean
  }
}
