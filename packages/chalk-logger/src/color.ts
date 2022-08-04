import invariant from '@guanghechen/invariant'
import type { Chalk } from 'chalk'
import chalk from 'chalk'

const colorKeywords = new Set([
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'gray',
])

const brightColorKeywords = new Set([
  'redBright',
  'greenBright',
  'yellowBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
  'whiteBright',
])

export type IColor = string | [r: number, g: number, b: number]
export function color2chalk(color: IColor, fg: boolean): Chalk {
  if (Array.isArray(color)) {
    const [r, g, b] = color
    invariant(
      Number.isInteger(r) && Number.isInteger(g) && Number.isInteger(b),
      `[color2chalk] Bad color ${color}`,
    )
    return fg ? chalk.rgb(r, g, b) : chalk.bgRgb(r, g, b)
  }

  if (colorKeywords.has(color) || brightColorKeywords.has(color)) {
    if (!fg) {
      // eslint-disable-next-line no-param-reassign
      color = 'bg' + color[0].toUpperCase() + color.slice(1)
    }
    return chalk[color].bind(chalk)
  }
  try {
    return fg ? chalk.keyword(color) : chalk.bgKeyword(color)
  } catch (error) {
    return fg ? chalk.hex(color) : chalk.bgHex(color)
  }
}

export class ColorfulChalk {
  public readonly fg: Chalk
  public readonly bg: Chalk | null

  constructor(fg: IColor, bg?: IColor) {
    this.fg = color2chalk(fg, true)
    if (bg == null) this.bg = null
    else this.bg = color2chalk(bg, false)
  }
}
