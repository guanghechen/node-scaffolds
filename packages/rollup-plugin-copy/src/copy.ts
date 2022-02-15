import chalk from 'chalk'
import fs from 'fs-extra'
import type { CopyOptions } from 'fs-extra'
import path from 'path'
import type rollup from 'rollup'
import type { RollupPluginCopyOptions, RollupPluginCopyTargetItem } from './types'
import { collectAndWatchingTargets } from './util'

export function copy(options: RollupPluginCopyOptions = {}): rollup.Plugin {
  const {
    targets = [],
    copyOnce = false,
    flatten = true,
    hook = 'buildEnd',
    watchHook = 'buildStart',
    verbose: shouldBeVerbose = false,
    ...restOptions
  } = options

  const log = {
    // print verbose messages
    verbose(message: string | (() => string)) {
      if (!shouldBeVerbose) return
      const details: string = typeof message === 'function' ? message() : message
      console.log(details)
    },
  }

  let copied = false
  let copyTargets: RollupPluginCopyTargetItem[] = []

  /**
   * Do copy operation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleCopy(context: rollup.PluginContext, ...args: unknown[]): Promise<void> {
    if (copyOnce && copied) return

    for (const copyTarget of copyTargets) {
      const { contents, dest, src, transformed } = copyTarget

      if (transformed) {
        await fs.outputFile(dest, contents, restOptions)
      } else {
        await fs.copy(src, dest, restOptions as CopyOptions)
      }

      log.verbose(() => {
        const flagKeys: ReadonlyArray<keyof RollupPluginCopyTargetItem> = ['renamed', 'transformed']

        const flags: string[] = flagKeys
          .filter(key => copyTarget[key])
          .map(key => key.charAt(0).toUpperCase())

        let message = chalk.green(`  ${chalk.bold(src)} → ${chalk.bold(dest)}`)
        if (flags.length) message = `${message} ${chalk.yellow(`[${flags.join(', ')}]`)}`
        return message
      })
    }

    copied = true
    log.verbose(copyTargets.length ? chalk.green('copied:') : chalk.yellow('no items to copy'))
  }

  const plugin: rollup.Plugin = {
    name: 'copy',
    async [watchHook](...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context: rollup.PluginContext = this as any

      if (!copyOnce || !copied) {
        copyTargets = await collectAndWatchingTargets(targets, flatten, restOptions)

        // Watching source files
        for (const target of copyTargets) {
          const srcPath = path.resolve(target.src)
          context.addWatchFile(srcPath)
        }
      }

      // Merge handleCopy and collectAndWatchingTargets
      if (hook === watchHook) {
        await handleCopy(context, ...args)
      }
    },
  }

  if (hook !== watchHook) {
    plugin[hook] = handleCopy
  }
  return plugin
}
