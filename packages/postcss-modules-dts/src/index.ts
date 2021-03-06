import { CSSDtsProcessor } from './css-dts'
import type { CSSDtsProcessorProps, GetCSSTokenHook } from './types'

export * from './css-dts'
export * from './types'

/**
 *
 * @param props
 * @returns
 */
export function dts(props: CSSDtsProcessorProps = {}): GetCSSTokenHook {
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
