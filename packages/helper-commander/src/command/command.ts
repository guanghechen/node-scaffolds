import commander from 'commander'
import type { ICommandConfigurationOptions } from '../types/configuration'

/**
 * Callback for handling the command
 *
 * @param args    command arguments
 * @param options command options
 * @param extra   extra args (neither declared command arguments nor command options)
 * @param self    current command
 */
export type ICommandActionCallback<T extends ICommandConfigurationOptions> = (
  args: string[],
  options: T,
  extra: string[],
  self: Command,
) => void | Promise<void> | never

export class Command extends commander.Command {
  // add missing type declarations
  public options: commander.Option[] | undefined
  protected _actionResults: unknown[] | undefined
  protected _storeOptionsAsProperties: boolean | undefined
  protected _optionValues: object | undefined
  protected _actionHandler: ((args: string[]) => void) | null | undefined
  protected _versionOptionName: string | undefined
  protected _version: string | undefined

  /**
   * Register callback `fn` for the command.
   *
   * @example
   * program
   *   .command('serve')
   *   .description('start service')
   *   .action(function() {
   *      // do work here
   *   });
   *
   * @param {Function} fn
   * @return {Command} `this` command for chaining
   */
  public override action<T extends ICommandConfigurationOptions>(
    fn: ICommandActionCallback<T>,
  ): this {
    const self = this

    const listener = (args: string[]): unknown | Promise<unknown> => {
      // The .action callback takes an extra parameter which is the command or options.
      const expectedArgsCount = self.args.length

      const actionArgs: Parameters<ICommandActionCallback<T>> = [
        args.slice(0, expectedArgsCount),
        self.opts() as T,
        args.slice(expectedArgsCount),
        self,
      ]

      const actionResult = fn.apply(self, actionArgs)
      return actionResult
    }

    self._actionHandler = listener
    return self
  }

  public override opts<T extends commander.OptionValues>(): T {
    const self = this
    const nodes: Command[] = [self]
    for (let parent = self.parent; parent != null; parent = parent.parent) {
      nodes.push(parent as Command)
    }

    const options: object = {}
    for (let i = nodes.length - 1; i >= 0; --i) {
      const o = nodes[i]
      if (o._storeOptionsAsProperties) {
        for (const option of o.options!) {
          const key = option.attributeName()
          options[key] = key === o._versionOptionName ? o._version : o[key]
        }
      } else {
        for (const key of Object.getOwnPropertyNames(o._optionValues)) {
          options[key] = o._optionValues![key]
        }
      }
    }

    return options as unknown as T
  }
}
