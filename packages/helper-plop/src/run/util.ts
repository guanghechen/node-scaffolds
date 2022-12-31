import chalk from 'chalk'
import nodePlop from 'node-plop'
import type { PlopGenerator, PlopGeneratorConfig } from 'node-plop'

/**
 * Convert a literal change type description to a symbolic description.
 *
 * @param name
 * @param noMap
 */
export function showChangeType(name: string, noMap: boolean): string {
  const dimType = chalk.dim(name)
  if (noMap) return dimType

  switch (name) {
    case 'function':
      return chalk.yellow('->')
    case 'add':
      return chalk.green('++')
    case 'addMany':
      return chalk.green('+!')
    case 'modify':
      return `${chalk.green('+')}${chalk.red('-')}`
    case 'append':
      return chalk.green('_+')
    case 'skip':
      return chalk.green('--')
    default:
      return dimType
  }
}

/**
 * Choose generator
 *
 * @param plopList
 * @param message
 */
export async function choosePlopGenerator(
  plopList: Array<{ name: string; description: string }>,
  message?: string,
): Promise<PlopGenerator> {
  const plop = await nodePlop('')
  const generator = plop.setGenerator('choose', {
    description: 'Choose plop generator',
    actions: [],
    prompts: [
      {
        type: 'list',
        name: 'generator',
        message: message || chalk.blue('[PLOP]') + ' Please choose a generator.',
        choices: plopList.map(function (p) {
          return {
            name: p.name + chalk.gray(p.description ? ' - ' + p.description : ''),
            value: p.name,
          }
        }),
      },
    ],
  } as PlopGeneratorConfig)
  return generator.runPrompts().then(results => results.generator)
}
