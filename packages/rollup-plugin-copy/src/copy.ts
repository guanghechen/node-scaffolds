import chalk from 'chalk'
import fs from 'fs-extra'
import type { CopyOptions } from 'fs-extra'
import globby from 'globby'
import { isPlainObject } from 'is-plain-object'
import path from 'path'
import type rollup from 'rollup'
import type { RollupPluginCopyOptions, RollupPluginCopyTargetItem } from './types'
import { generateCopyTarget, stringify } from './util'

export function copy(options: RollupPluginCopyOptions = {}): rollup.Plugin {
  const {
    targets = [],
    copyOnce = false,
    flatten = true,
    hook = 'buildEnd',
    watchHook = 'buildStart',
    verbose: shouldBeVerbose = false,
    ...globalGlobbyOptions
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function collectAndWatchingTargets(
    context: rollup.PluginContext,
    ...args: unknown[]
  ): Promise<void> {
    if (copyOnce && copied) return

    // Recollect copyTargets
    copyTargets = []
    if (Array.isArray(targets) && targets.length) {
      for (const target of targets) {
        if (!isPlainObject(target)) {
          throw new Error(`${stringify(target)} target must be an object`)
        }

        const { dest, rename, src, transform, ...restTargetOptions } = target

        if (!src || !dest) {
          throw new Error(`${stringify(target)} target must have "src" and "dest" properties`)
        }

        if (rename && typeof rename !== 'string' && typeof rename !== 'function') {
          throw new Error(
            `${stringify(target)} target's "rename" property must be a string or a function`,
          )
        }

        const matchedPaths = await globby(src, {
          expandDirectories: false,
          onlyFiles: false,
          ...globalGlobbyOptions,
          ...restTargetOptions,
        })

        if (matchedPaths.length) {
          const options = { flatten, rename, transform }
          for (const matchedPath of matchedPaths) {
            const destinations = Array.isArray(dest) ? dest : [dest]
            for (const destination of destinations) {
              const copyTarget: RollupPluginCopyTargetItem = await generateCopyTarget(
                matchedPath,
                destination,
                options,
              )
              copyTargets.push(copyTarget)
            }
          }
        }
      }
    }

    // Watching source files
    for (const target of copyTargets) {
      const srcPath = path.resolve(target.src)
      context.addWatchFile(srcPath)
    }
  }

  /**
   * Do copy operation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleCopy(context: rollup.PluginContext, ...args: unknown[]): Promise<void> {
    if (copyOnce && copied) return

    if (copyTargets.length) {
      log.verbose(chalk.green('copied:'))

      for (const copyTarget of copyTargets) {
        const { contents, dest, src, transformed } = copyTarget

        if (transformed) {
          await fs.outputFile(dest, contents, globalGlobbyOptions)
        } else {
          await fs.copy(src, dest, globalGlobbyOptions as CopyOptions)
        }

        log.verbose(() => {
          const flagKeys: ReadonlyArray<keyof RollupPluginCopyTargetItem> = [
            'renamed',
            'transformed',
          ]

          const flags: string[] = flagKeys
            .filter(key => copyTarget[key])
            .map(key => key.charAt(0).toUpperCase())

          let message = chalk.green(`  ${chalk.bold(src)} → ${chalk.bold(dest)}`)
          if (flags.length) message = `${message} ${chalk.yellow(`[${flags.join(', ')}]`)}`
          return message
        })
      }
    } else {
      log.verbose(chalk.yellow('no items to copy'))
    }

    copied = true
  }

  const plugin = {
    name: 'copy',
    async [watchHook](...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context: rollup.PluginContext = this as any
      await collectAndWatchingTargets(context, ...args)

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
