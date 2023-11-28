import type { Node, Element } from 'hast'
import { rehype } from 'rehype'
import { remove } from 'unist-util-remove'
import { SKIP, visit } from 'unist-util-visit'

export const PKG_TAB_TAG_NAME = 'pkg-tab'

let id = 0

const pkgProcessor = rehype()
  .data('settings', { fragment: true })
  .use(function pkgTransformer() {
    return (tree, file) => {
      file.data['panels'] = []

      // Remove all scripts and styles.
      remove(tree, (node) => isElement(node) && (node.tagName === 'link' || node.tagName === 'script'))

      let isFirstPanel = true

      // https://github.com/withastro/starlight/blob/main/packages/starlight/user-components/rehype-tabs.ts
      visit(tree, ['element'], (node) => {
        if (!isElement(node) || node.tagName !== PKG_TAB_TAG_NAME) {
          return
        }

        const label = node.properties['dataLabel']
        delete node.properties['dataLabel']

        if (typeof label !== 'string') {
          throw new TypeError(`Missing 'label' attribute for <${PKG_TAB_TAG_NAME}>.`)
        }

        const panel = getPkgPanel(id++, label)

        if (Array.isArray(file.data['panels'])) {
          file.data['panels'].push(panel)
        }

        node.tagName = 'section'
        node.properties['id'] = panel.panelID
        node.properties['aria-labelledby'] = panel.tabID
        node.properties['role'] = 'tabpanel'

        if (isFirstPanel) {
          isFirstPanel = false
        } else {
          node.properties['hidden'] = true
        }

        return SKIP
      })
    }
  })

export function processCommandsHtml(commands: string) {
  const file = pkgProcessor.processSync({ value: commands })

  return {
    html: file.toString(),
    panels: file.data['panels'] as PkgPanel[],
  }
}

function isElement(node: Node): node is Element {
  return node.type === 'element'
}

function getPkgPanel(id: number, label: string): PkgPanel {
  return {
    label,
    panelID: `pkg-panel-${id}`,
    tabID: `pkg-tab-${id}`,
  }
}

interface PkgPanel {
  label: string
  panelID: string
  tabID: string
}
