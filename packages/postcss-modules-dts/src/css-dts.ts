import { coverBoolean, coverString } from '@guanghechen/helper-option'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import reservedWords from 'reserved-words'
import type { ICssDtsProcessorProps, IGetCSSTokenHook } from './types'

export class CSSDtsProcessor implements IGetCSSTokenHook {
  public readonly indent: string
  public readonly semicolon: string
  public readonly encoding: BufferEncoding
  public readonly dtsForCompiledCss: boolean
  public readonly shouldIgnore: Exclude<ICssDtsProcessorProps['shouldIgnore'], undefined>

  constructor(props: ICssDtsProcessorProps) {
    this.indent = coverString('  ', props.indent)
    this.semicolon = coverBoolean(false, props.semicolon) ? ';' : ''
    this.encoding = coverString<BufferEncoding>('utf8', props.encoding)
    this.dtsForCompiledCss = coverBoolean(false, props.dtsForCompiledCss)
    this.shouldIgnore = props.shouldIgnore != null ? props.shouldIgnore : () => false
  }

  /**
   *
   * @param cssPath
   * @param json
   * @param outputFilePath
   * @see https://github.com/css-modules/postcss-modules#saving-exported-classes
   */
  public async getJSON(
    cssPath: string,
    json: Record<string, string>,
    outputFilePath: string,
  ): Promise<void> {
    if (this.shouldIgnore(cssPath, json, outputFilePath)) return

    const classNames: string[] = Object.keys(json)
    const dtsContent: string = this._generateDts(classNames)

    // Generate *.d.ts
    await this._writeDts(cssPath + '.d.ts', dtsContent)
    if (this.dtsForCompiledCss) {
      await this._writeDts(outputFilePath + '.d.ts', dtsContent)
    }
  }

  /**
   * Calc content of .d.ts
   * @param classNames
   */
  protected _generateDts(classNames: string[]): string {
    const { indent, semicolon } = this
    const uniqueName = 'stylesheet'
    return classNames
      .sort()
      .filter(x => !/[-]/.test(x) && !reservedWords.check(x))
      .map(x => `export const ${x}: string${semicolon}`)
      .join('\n')
      .concat('\n\n\n')
      .concat('interface Stylesheet {\n')
      .concat(classNames.map(x => `${indent}'${x}': string`).join('\n'))
      .concat('\n}\n\n\n')
      .concat(`declare const ${uniqueName}: Stylesheet${semicolon}\n`)
      .concat(`export default ${uniqueName}${semicolon}\n`)
  }

  protected async _writeDts(filepath: string, content: string): Promise<void> {
    const dir: string = path.dirname(filepath)
    if (!existsSync(dir)) await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filepath, content, { encoding: this.encoding })
  }
}
