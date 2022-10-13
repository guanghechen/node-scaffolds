import type { LaunchOptions } from 'liftoff'
import minimist from 'minimist'
import { Plop, run } from 'plop'

/**
 * Call the Plop.launch
 *
 * @param createOptions
 */
export function launch(
  argv: string[],
  createOptions?: (args: object) => Partial<LaunchOptions>,
): Promise<void> {
  const args = minimist(argv.slice(2))

  const options: LaunchOptions = {
    cwd: args.cwd,
    configPath: args.configPath,
    require: args.require,
    forcedFlags: args.forceFlags,
    completion: args.completion,
    ...(createOptions != null ? createOptions(args) : undefined),
  }

  // Call the Plop.launch
  return new Promise<void>((resolve, reject) => {
    Plop.launch(options, env => {
      try {
        run(env, undefined, true)
        resolve()
      } catch (e: unknown) {
        reject(e)
      }
    })
  })
}
