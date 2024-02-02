const pkgManagers = ['npm', 'pnpm', 'yarn', 'bun', 'ni'] as const

const commands = {
  npm: {
    add: 'npm install',
    devOption: '-D',
  },
  pnpm: {
    add: 'pnpm add',
    devOption: '-D',
  },
  yarn: {
    add: 'yarn add',
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

let id = 0

export function getCommands(type: CommandType, pkg: string | undefined, options: CommandOptions): Command[] {
  const pkgManagers = getSupportedPkgManagers(type)

  return pkgManagers.map((pkgManager) => {
    const commandId = id++

    return {
      content: getCommandContent(pkgManager, type, pkg, options),
      label: pkgManager,
      panelID: `pkg-panel-${commandId}`,
      tabID: `pkg-tab-${commandId}`,
    }
  })
}

function getSupportedPkgManagers(type: CommandType) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- in preparation for additonal command types
  return pkgManagers.filter((pkgManager) => commands[pkgManager][type] !== undefined)
}

function getCommandContent(
  pkgManager: PackageManager,
  type: CommandType,
  pkg: string | undefined,
  options: CommandOptions,
) {
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

interface Command {
  content: string
  label: string
  panelID: string
  tabID: string
}
