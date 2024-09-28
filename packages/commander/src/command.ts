import type { ICommandConfigurationOptions } from '@guanghechen/cli'
import type { OptionValues } from 'commander'
import { Command as Command$ } from 'commander'

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

export class Command extends Command$ {
  // add missing type declarations
  protected _actionHandler: ((args: string[]) => void) | null | undefined
  protected _optionValues: object
  protected _storeOptionsAsProperties: boolean
  protected _version: string | undefined
  protected _versionOptionName: string | undefined

  constructor() {
    super()

    this._optionValues = {}
    this._storeOptionsAsProperties = false
  }

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
    const listener = (args: string[]): unknown | Promise<unknown> => {
      // The .action callback takes an extra parameter which is the command or options.
      const expectedArgsCount = this.registeredArguments.length

      const actionArgs: Parameters<ICommandActionCallback<T>> = [
        args.slice(0, expectedArgsCount),
        this.opts() as T,
        args.slice(expectedArgsCount),
        this,
      ]

      const actionResult = fn.apply(this, actionArgs)
      return actionResult
    }

    this._actionHandler = listener
    return this
  }

  public override opts<T extends OptionValues>(): T {
    const nodes: Command[] = [this]
    for (let parent = this.parent; parent != null; parent = parent.parent) {
      nodes.push(parent as Command)
    }

    const options: Record<string, unknown> = {}
    for (let i = nodes.length - 1; i >= 0; --i) {
      const o = nodes[i]
      if (o._storeOptionsAsProperties) {
        for (const option of o.options!) {
          const key = option.attributeName()
          options[key] = key === o._versionOptionName ? o._version : (o as any)[key]
        }
      } else {
        const optionValues: Record<string, unknown> = o._optionValues as any
        for (const key of Object.getOwnPropertyNames(optionValues)) {
          options[key] = optionValues[key]
        }
      }
    }
    return options as unknown as T
  }
}
