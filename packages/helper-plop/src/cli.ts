import type { PrepareOptions } from 'liftoff'
import minimist from 'minimist'

/**
 * Call the Plop.launch
 *
 * @param createOptions
 */
export async function launch(
  argv: string[],
  createOptions?: (args: object) => Partial<PrepareOptions>,
): Promise<void> {
  const args = minimist(argv.slice(2))

  const options: PrepareOptions = {
    cwd: args.cwd,
    configPath: args.configPath,
    preload: args.preload,
    completion: args.completion,
    ...(createOptions != null ? createOptions(args) : undefined),
  }

  const { Plop, run } = await import('plop')

  // Call the Plop.launch
  return new Promise<void>((resolve, reject) => {
    Plop.prepare(options, env => {
      try {
        Plop.execute(env, env => {
          void run(env, undefined, true).then(resolve).catch(reject)
        })
        resolve()
      } catch (e: unknown) {
        reject(e)
      }
    })
  })
}
