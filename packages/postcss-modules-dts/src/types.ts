/**
 * Hook of postcss-modules.
 * @see https://github.com/css-modules/postcss-modules#saving-exported-classes
 */
export interface GetCSSTokenHook {
  /**
   * get css tokens.
   * @param cssPath
   * @param json
   * @param outputFilePath
   */
  getJSON?(
    cssPath: string,
    json: Record<string, string>,
    outputFilePath: string,
  ): Promise<void> | void
}

/**
 * Params for constructing a CSSDtsProcessor
 */
export interface CSSDtsProcessorProps extends GetCSSTokenHook {
  /**
   * Encoding of the generated `*.d.ts` files.
   * @default 'utf-8'
   */
  encoding?: string
  /**
   * Code indent in the generated `*.d.ts` files.
   * @default '  '
   */
  indent?: string
  /**
   * whether to add a semicolon at the end of the statement
   * @default false
   */
  semicolon?: boolean
  /**
   * Whether if generated `*.d.ts` for compiled css files.
   * @default false
   */
  dtsForCompiledCss?: boolean
  /**
   * Determine whether to ignore the given source file or css token.
   * @param cssPath         filepath of the css file
   * @param json            css class name map
   * @param outputFilepath  filepath of the ts declaration file
   */
  shouldIgnore?(cssPath: string, json: Record<string, string>, outputFilePath: string): boolean
}
