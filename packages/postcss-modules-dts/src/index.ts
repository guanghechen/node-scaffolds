import { CSSDtsProcessor } from './css-dts'
import type { ICssDtsProcessorProps, IGetCSSTokenHook } from './types'

export * from './css-dts'
export * from './types'

/**
 *
 * @param props
 * @returns
 */
export function dts(props: ICssDtsProcessorProps = {}): IGetCSSTokenHook {
  const cssDts = new CSSDtsProcessor(props)
  return {
    async getJSON(
      cssPath: string,
      json: Record<string, string>,
      outputFilePath: string,
    ): Promise<void> {
      await props.getJSON?.(cssPath, json, outputFilePath)
      await cssDts.getJSON(cssPath, json, outputFilePath)
    },
  }
}

export default dts
