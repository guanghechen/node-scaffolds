import {
  coverString,
  isFunction,
  isNonBlankString,
} from '@guanghechen/option-helper'
import type { InputQuestion } from 'inquirer'
import mockStdin from 'mock-stdin'
import nodePlop from 'node-plop'
import { runPlop } from './run'

/**
 * A utility funcs for testing plop with boilerplates.
 *
 * @param templateConfig  filepath of plop.js
 * @param plopBypass      inquirer prompts bypass
 * @param mockAnswers     mock inputs
 * @param defaultAnswers  default answers
 */
export async function runPlopWithMock(
  templateConfig: string,
  plopBypass: string[],
  mockAnswers: string[],
  defaultAnswers: Record<string, unknown> = {},
): Promise<void> {
  // Mock stdin
  const stdin = mockStdin.stdin()
  stdin.reset()

  try {
    const cwd = process.cwd()
    const plop = nodePlop(templateConfig, {
      force: false,
      destBasePath: cwd,
    })

    // get prompts length to calculate the number of bypass parameters consumed
    let bypassForPlopConfigCount = 0
    const generators = plop.getGeneratorList()
    if (generators.length === 1) {
      const generator = plop.getGenerator(generators[0].name)
      bypassForPlopConfigCount = generator.prompts.length
    } else {
      const generateName = plopBypass[0]
      const generator = plop.getGenerator(generateName)
      bypassForPlopConfigCount = generator.prompts.length + 1
    }

    const bypassForPlopConfig = plopBypass.splice(0, bypassForPlopConfigCount)
    const promise = runPlop(plop, bypassForPlopConfig, defaultAnswers)

    // Waiting for mock inputs done.
    if (mockAnswers.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 50))
      for (const answer of mockAnswers) {
        stdin.send(answer.replace(/\n*$/, '\n'))
        await new Promise(resolve => setTimeout(resolve, 20))
      }
    }

    // Waiting for plop executor finished.
    await promise
  } finally {
    // Restore stdin
    stdin.end()
    stdin.restore()
  }
}

/**
 * Run prompts with mock inputs.
 *
 * @param prompts     inquirer prompts
 * @param bypass      bypass inputs
 * @param mockInputs  inputs from stdin
 * @returns
 */
export function runPromptsWithMock(
  prompts: Array<InputQuestion<any>>,
  bypass: string[] = [],
  mockInputs: string[] = [],
): Record<string, unknown> {
  const results: Record<string, unknown> = {}

  let i = 0
  let j = 0
  for (const prompt of prompts) {
    if (i < bypass.length) {
      results[prompt.name!] = bypass[i]
      i += 1
      continue
    }

    results[prompt.name!] = coverString(
      '',
      coverString(
        isFunction(prompt.default) ? prompt.default(results) : prompt.default,
        mockInputs[j],
        isNonBlankString,
      ),
    )
    j += 1
  }

  return results
}
