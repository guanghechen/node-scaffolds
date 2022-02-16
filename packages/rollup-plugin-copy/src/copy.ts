import chalk from 'chalk'
import path from 'path'
import type rollup from 'rollup'
import type { ICopyTargetItem, IOptions } from './types'
import { collectAndWatchingTargets, copySingleItem, logger, normalizeOptions } from './util'

export function copy(options: IOptions = {}): rollup.Plugin {
  const config = normalizeOptions(options)
  const { targets, copyOnce, hook, watchHook } = config

  logger.shouldBeVerbose = config.verbose
  let copied = false
  let copyTargets: ReadonlyArray<ICopyTargetItem> = []

  /**
   * Do copy operation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleCopy(context: rollup.PluginContext, ...args: unknown[]): Promise<void> {
    if (copyOnce && copied) return

    for (const copyTarget of copyTargets) {
      await copySingleItem(copyTarget)
    }

    copied = true
    logger.verbose(copyTargets.length ? chalk.green('copied:') : chalk.yellow('no items to copy'))
  }

  const srcMap: Map<string, ICopyTargetItem> = new Map()
  const plugin: rollup.Plugin = {
    name: 'copy',
    async [watchHook](...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context: rollup.PluginContext = this as any

      if (!copyOnce || !copied) {
        copyTargets = await collectAndWatchingTargets(targets)

        for (const target of copyTargets) {
          srcMap.set(target.srcPath, target)
        }

        // Watching source files
        for (const target of copyTargets) {
          const srcPath = path.resolve(target.srcPath)
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
