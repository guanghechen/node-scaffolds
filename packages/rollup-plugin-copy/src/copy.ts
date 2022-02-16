import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import type rollup from 'rollup'
import type { ICopyTargetItem, IOptions } from './types'
import { collectAndWatchingTargets, normalizeOptions } from './util'

export function copy(options: IOptions = {}): rollup.Plugin {
  const config = normalizeOptions(options)
  const {
    targets,
    copyOnce,
    flatten,
    hook,
    watchHook,
    verbose: shouldBeVerbose,
    globbyOptions,
    fsExtraOptions,
  } = config

  const log = {
    // print verbose messages
    verbose(message: string | (() => string)) {
      if (!shouldBeVerbose) return
      const details: string = typeof message === 'function' ? message() : message
      console.log(details)
    },
  }

  let copied = false
  let copyTargets: ICopyTargetItem[] = []

  /**
   * Do copy operation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleCopy(context: rollup.PluginContext, ...args: unknown[]): Promise<void> {
    if (copyOnce && copied) return

    for (const copyTarget of copyTargets) {
      const { contents, dest, src, transformed } = copyTarget

      if (transformed) {
        await fs.outputFile(dest, contents, fsExtraOptions.outputFile)
      } else {
        await fs.copy(src, dest, fsExtraOptions.copy)
      }

      log.verbose(() => {
        const flagKeys: ReadonlyArray<keyof ICopyTargetItem> = ['renamed', 'transformed']

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
        copyTargets = await collectAndWatchingTargets(targets, flatten, globbyOptions)

        const srcMap: Map<string, ICopyTargetItem> = new Map()
        for (const target of copyTargets) {
          srcMap.set(target.src, target)
        }

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
