import { markdown } from '@astropub/md'

import { processCommandsHtml, PKG_TAB_TAG_NAME } from '@libs/rehype'

const pkgManagers = ['npm', 'yarn', 'pnpm', 'bun', 'ni'] as const

const commands = {
  npm: {
    add: 'npm install',
    devOption: '-D',
  },
  yarn: {
    add: 'yarn add',
    devOption: '-D',
  },
  pnpm: {
    add: 'pnpm add',
    devOption: '-D',
  },
  bun: {
    add: 'bun add',
    devOption: '-d',
  },
  ni: {
    add: 'ni',
    devOption: '-D',
  },
} satisfies Record<PackageManager, Record<CommandType | 'devOption', string>>

export async function getCommandsHtml(type: CommandType, pkg: string | undefined, options: CommandOptions) {
  const commands = await markdown.inline(
    getSupportedPkgManagers(type)
      .map(
        (pkgManager) => `<${PKG_TAB_TAG_NAME} data-label="${pkgManager}">

\`\`\`shell frame="none"
${getCommand(pkgManager, type, pkg, options)}
\`\`\`

</${PKG_TAB_TAG_NAME}>`,
      )
      .join('\n'),
  )

  return processCommandsHtml(commands.toString())
}

function getSupportedPkgManagers(type: CommandType) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- in preparation for additonal command types
  return pkgManagers.filter((pkgManager) => commands[pkgManager][type] !== undefined)
}

function getCommand(pkgManager: PackageManager, type: CommandType, pkg: string | undefined, options: CommandOptions) {
  let command = commands[pkgManager][type]

  if (!command) {
    throw new Error(`Command type '${type}' is not supported for package manager '${pkgManager}'.`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- in preparation for additonal command types
  if (type === 'add' && options.dev) {
    command += ` ${commands[pkgManager].devOption}`
  }

  if (pkg) {
    command += ` ${pkg}`
  }

  return command
}

export type PackageManager = (typeof pkgManagers)[number]

export type CommandType = 'add'

export interface CommandOptions {
  dev?: boolean
}
