import chalk from 'chalk'
import { stripAnsi } from '../src'

describe('stripAnsi', () => {
  test('basic', () => {
    const text = 'Hello, world!'
    const coloredText = chalk.gray(text)
    expect(coloredText).not.toEqual(text)
    expect(stripAnsi(coloredText)).toEqual(text)
  })
})
