const pkgManagers = ['npm', 'pnpm', 'yarn', 'bun', 'ni'] as const

const commands = {
  npm: {
    add: 'npm install',
    devOption: '-D',
    dlx: 'npx',
    exec: 'npx',
  },
  pnpm: {
    add: 'pnpm add',
    devOption: '-D',
    dlx: 'pnpx',
    exec: 'pnpm',
  },
  yarn: {
    add: 'yarn add',
    devOption: '-D',
    dlx: 'yarn dlx',
    exec: 'yarn',
  },
  bun: {
    add: 'bun add',
    devOption: '-d',
    dlx: 'bunx',
    exec: 'bun run --bun',
  },
  ni: {
    add: 'ni',
    devOption: '-D',
    dlx: 'nlx',
    exec: 'nr',
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
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- in preparation for additional command types
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

  if (type === 'add' && options.dev) {
    command += ` ${commands[pkgManager].devOption}`
  }

  if (pkg) {
    command += ` ${pkg}`
  }

  if (options.args && options.args.length > 0) {
    if (pkgManager === 'npm' && type === 'add') {
      command += ' --'
    }

    command += ` ${options.args}`
  }

  return command
}

export type PackageManager = (typeof pkgManagers)[number]

export type CommandType = 'add' | 'dlx' | 'exec'

export interface CommandOptions {
  args?: string
  dev?: boolean
}

interface Command {
  content: string
  label: string
  panelID: string
  tabID: string
}
