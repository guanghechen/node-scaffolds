import { coverBoolean, coverString } from '@guanghechen/helper-option'
import fs from 'fs-extra'
import reservedWords from 'reserved-words'
import type { CSSDtsProcessorProps, GetCSSTokenHook } from './types'

export class CSSDtsProcessor implements GetCSSTokenHook {
  public readonly indent: string
  public readonly semicolon: string
  public readonly encoding: string
  public readonly dtsForCompiledCss: boolean
  public readonly shouldIgnore: Exclude<CSSDtsProcessorProps['shouldIgnore'], undefined>

  constructor(props: CSSDtsProcessorProps) {
    this.indent = coverString('  ', props.indent)
    this.semicolon = coverBoolean(false, props.semicolon) ? ';' : ''
    this.encoding = coverString('utf-8', props.encoding)
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
    const dtsContent: string = this.calcDts(classNames)
    await this.writeFile(cssPath, dtsContent)
    if (this.dtsForCompiledCss) {
      await this.writeFile(outputFilePath, dtsContent)
    }
  }

  /**
   * calc content of .d.ts
   * @param classNames
   */
  protected calcDts(classNames: string[]): string {
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

  /**
   * create .d.ts
   * @param cssPath
   * @param classNames
   * @returns filePath of .d.ts created
   */
  protected async writeFile(cssPath: string, dtsContent: string): Promise<string> {
    const dtsFilePath: string = cssPath + '.d.ts'
    await fs.writeFile(dtsFilePath, dtsContent, this.encoding)
    return dtsFilePath
  }
}
