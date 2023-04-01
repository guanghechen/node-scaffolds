import type { OutputOptions, RollupOptions } from 'rollup'

export function findElement<T>(
  elements: T | T[] | undefined,
  predicate: (element: T) => boolean,
): T | undefined {
  if (elements === undefined) return undefined
  if (Array.isArray(elements)) return elements.find(predicate)
  return predicate(elements) ? elements : undefined
}

export function hasSpecifiedOutputConfig(
  configs: ReadonlyArray<Pick<RollupOptions, 'output'>>,
  predicate: (output: OutputOptions) => boolean,
): boolean {
  return configs.some(config => findElement(config.output, predicate))
}

export function hasSpecifiedOutputFile(
  configs: ReadonlyArray<Pick<RollupOptions, 'output'>>,
  outputFile: string,
): boolean {
  return hasSpecifiedOutputConfig(configs, output => output.file === outputFile)
}
