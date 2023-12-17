import type { NewPlugin as IFormatSerializer } from 'pretty-format'

export function keyOrderSerializer(
  preferKeyOrders: ReadonlyArray<string>,
  test: (o: object) => boolean,
): IFormatSerializer {
  const preferKeySets: Set<string> = new Set(preferKeyOrders)
  return {
    serialize: (originalValue, config, indentation, depth, refs, printer) => {
      const originalKeys: string[] = Object.keys(originalValue)
      const keys: string[] = preferKeyOrders
        .filter(key => originalKeys.includes(key))
        .concat(originalKeys.filter(key => !preferKeySets.has(key)))

      let result = '{'
      if (keys.length > 0) {
        result += config.spacingOuter

        const indentationNext = indentation + config.indent
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          const name = printer(key, config, indentationNext, depth, refs)
          const value = printer(originalValue[key], config, indentationNext, depth, refs)

          result += `${indentationNext + name}: ${value}`

          if (i < keys.length - 1) {
            result += `,${config.spacingInner}`
          } else if (!config.min) {
            result += ','
          }
        }

        result += config.spacingOuter + indentation
      }
      return result + '}'
    },
    test: (value: unknown): boolean => {
      if (value === null || typeof value !== 'object') return false
      if (Array.isArray(value)) return false
      return test(value)
    },
  }
}
