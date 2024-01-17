import type { ISubCommand } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../shared/core/constant'
import type { IGitCipherSubCommandProcessor } from '../_base'
import { GitCipherSubCommand } from '../_base'
import { type IGitCipherInitContext, createInitContextFromOptions } from './context'
import type { IGitCipherInitOptions } from './option'
import { resolveSubCommandInitOptions } from './option'
import { GitCipherInit } from './process'

type O = IGitCipherInitOptions
type C = IGitCipherInitContext

export class GitCipherSubCommandInit extends GitCipherSubCommand<O, C> implements ISubCommand<O> {
  public override readonly subCommandName: string = 'init'
  public override readonly aliases: string[] = ['i']

  public override command(processor: IGitCipherSubCommandProcessor<O, C>): Command {
    const { subCommandName, aliases } = this
    const command = new Command()

    command
      .name(subCommandName)
      .aliases(aliases)
      .arguments('<workspace>')
      .description('Initialize a encrypt / decrypt able git repo.')
      .option(
        '--catalog-config-path, --catalogConfigPath <catalogConfigPath>',
        'The path of catalog file of crypt repo. (relative of cryptRootDir)',
      )
      .option(
        '--content-hash-algorithm, --contentHashAlgorithm <contentHashAlgorithm>',
        'Hash algorithm for generate MAC for content.',
      )
      .option(
        '--crypt-files-dir, --cryptFilesDir <cryptFilesDir>',
        'The path of not-plain files located. (relative of cryptRootDir)',
      )
      .option(
        '--crypt-path-salt, --cryptPathSalt <cryptPathSalt>',
        'Salt for generate encrypted file path. (utf8 string)',
      )
      .option('--git-gpg-sign', `Config git commit.gpgSign to 'true'.`)
      .option('--no-git-gpg-sign', `Config git commit.gpgSign to 'false'.`)
      .option(
        '--secret-key-size, --secretKeySize <secretKeySize>',
        'Key size of the secret cipherFactory.',
      )
      .option(
        '--keep-integrity-pattens, --keepIntegrityPatterns <keepIntegrityPatterns>',
        'Glob patterns indicated which files should be keepIntegrity.',
        (val, acc: string[]) => acc.concat(val),
        [],
      )
      .option(
        '--keep-plain-pattens, --keepPlainPatterns <keepPlainPatterns>',
        'Glob patterns indicated which files should be keepPlain.',
        (val, acc: string[]) => acc.concat(val),
        [],
      )
      .option('--main-iv-size, --mainIvSize <mainIvSize>', 'IV size of main cipherFactory.')
      .option('--main-key-size, --mainKeySize <mainKeySize>', 'Key size of main cipherFactory.')
      .option('--part-code-prefix, --partCodePrefix <partCodePrefix>', 'Prefix of parts code.')
      .option(
        '--path-hash-algorithm, --pathHashAlgorithm <pathHashAlgorithm>',
        'Hash algorithm for generate MAC for encrypted filepath.',
      )
      .option(
        '--secret-iv-size, --secretIvSize <secretIvSize>',
        'IV size of the secret cipherFactory.',
      )
      .option(
        '--secret-key-size, --secretKeySize <secretKeySize>',
        'Key size of the secret cipherFactory.',
      )
      .action(async function (args: string[], options: IGitCipherInitOptions) {
        await processor.process(args, options)
      })

    return command
  }

  public override async resolveProcessor(
    args: string[],
    options: O,
  ): Promise<IGitCipherSubCommandProcessor<O, C>> {
    const { subCommandName, reporter, inputAnswer } = this
    const resolvedOptions: O = resolveSubCommandInitOptions(
      COMMAND_NAME,
      subCommandName,
      args,
      options,
      reporter,
    )
    const context: C = await createInitContextFromOptions(resolvedOptions)
    const processor: IGitCipherSubCommandProcessor<O, C> = new GitCipherInit({
      context,
      reporter,
      inputAnswer,
    })
    return processor
  }
}
