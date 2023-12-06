import { coverBoolean } from '@guanghechen/helper-option'
import type { NodePlopAPI, PlopGenerator } from 'node-plop'
import type {
  IPlopActionHooksChanges,
  IPlopActionHooksFailures,
  IRunGeneratorOptions,
} from './types'
import { choosePlopGenerator, showChangeType } from './util'

/**
 * Execute a plop generator.
 *
 * @param generator
 * @param bypassArr
 */
export async function runGenerator(
  generator: PlopGenerator,
  bypassArr?: string[],
  defaultAnswers: object = {},
  opts: IRunGeneratorOptions = {},
): Promise<void> {
  const ora = await import('ora').then(md => md.default)
  const progressSpinner = ora()

  const noMap = coverBoolean(false, opts.showTypeNames)
  const promptsAnswers = await generator.runPrompts(bypassArr)
  const answers = { ...defaultAnswers, ...promptsAnswers }

  const onComment = (msg: string): void => {
    progressSpinner.info(msg)
    progressSpinner.start()
  }

  // Callback on success.
  const onSuccess = (change: IPlopActionHooksChanges): void => {
    let line = ''
    if (change.type) {
      line += ` ${showChangeType(change.type, noMap)}`
    }
    if (change.path) {
      line += ` ${change.path}`
    }
    progressSpinner.succeed(line)
    progressSpinner.start()
  }

  // Callback on failure.
  const onFailure = (fail: IPlopActionHooksFailures): void => {
    let line = ''
    if (fail.type) {
      line += ` ${showChangeType(fail.type, noMap)}`
    }
    if (fail.path) {
      line += ` ${fail.path}`
    }

    const errMsg = fail.error || fail.message
    if (errMsg) {
      line += ` ${errMsg}`
    }
    progressSpinner.fail(line)
    progressSpinner.start()
  }

  progressSpinner.start()
  await generator.runActions(answers, { onSuccess, onFailure, onComment })
  progressSpinner.stop()
}

/**
 * Execute plop.
 *
 * @param plop
 * @param reporter
 */
export async function runPlop(
  plop: NodePlopAPI,
  bypassArr?: string[],
  defaultAnswers: object = {},
): Promise<string | void> {
  const generators = plop.getGeneratorList()

  if (generators.length <= 0) {
    // no generators?! there's clearly something wrong here
    const error = '[PLOP] No generator found in plopfile'
    return error
  }

  let generator: PlopGenerator | null = null
  const generatorNames = generators.map(v => v.name)

  if (generators.length === 1) {
    generator = plop.getGenerator(generatorNames[0])
  } else {
    generator = await choosePlopGenerator(generators, plop.getWelcomeMessage())
  }

  await runGenerator(generator, bypassArr, defaultAnswers)
}
