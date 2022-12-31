import { isArray, isString } from '@guanghechen/helper-is'
import invariant from '@guanghechen/invariant'
import type { ChalkInstance } from 'chalk'
import chalk from 'chalk'

export type IColorKeyword =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'gray'
  | 'grey'
  | 'blackBright'
  | 'redBright'
  | 'greenBright'
  | 'yellowBright'
  | 'blueBright'
  | 'magentaBright'
  | 'cyanBright'
  | 'whiteBright'
  | 'bgBlack'
  | 'bgGreen'
  | 'bgYellow'
  | 'bgBlue'
  | 'bgMagenta'
  | 'bgCyan'
  | 'bgWhite'
  | 'bgGray'
  | 'bgGrey'
  | 'bgBlackBright'
  | 'bgRedBright'
  | 'bgGreenBright'
  | 'bgYellowBright'
  | 'bgBlueBright'
  | 'bgMagentaBright'
  | 'bgCyanBright'
  | 'bgWhiteBright'

const colorKeywords = new Set<IColorKeyword>([
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'gray',
  'grey',
  'blackBright',
  'redBright',
  'greenBright',
  'yellowBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
  'whiteBright',
  'bgBlack',
  'bgGreen',
  'bgYellow',
  'bgBlue',
  'bgMagenta',
  'bgCyan',
  'bgWhite',
  'bgGray',
  'bgGrey',
  'bgBlackBright',
  'bgRedBright',
  'bgGreenBright',
  'bgYellowBright',
  'bgBlueBright',
  'bgMagentaBright',
  'bgCyanBright',
  'bgWhiteBright',
])

export type IColor = ChalkInstance | IColorKeyword | string | [r: number, g: number, b: number]
export function color2chalk(color: IColor, fg: boolean): ChalkInstance {
  if (isArray(color)) {
    const [r, g, b] = color
    invariant(
      Number.isInteger(r) && Number.isInteger(g) && Number.isInteger(b),
      `[color2chalk] Bad color ${color}`,
    )
    return fg ? chalk.rgb(r, g, b) : chalk.bgRgb(r, g, b)
  }

  if (isString(color)) {
    if (colorKeywords.has(color as IColorKeyword)) {
      if (!fg && !/^bg/.test(color)) {
        // eslint-disable-next-line no-param-reassign
        color = 'bg' + color[0].toUpperCase() + color.slice(1)
      }
      return chalk[color]
    }

    return fg ? chalk.hex(color) : chalk.bgHex(color)
  }

  return color as ChalkInstance
}

export class ColorfulChalk {
  public readonly fg: ChalkInstance
  public readonly bg: ChalkInstance | null

  constructor(fg: IColor, bg?: IColor) {
    this.fg = color2chalk(fg, true)
    if (bg == null) this.bg = null
    else this.bg = color2chalk(bg, false)
  }
}
