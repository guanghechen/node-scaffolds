import {
  toCamelCase,
  toCapitalCase,
  toConstantCase,
  toDotCase,
  toKebabCase,
  toLowerCase,
  toPascalCase,
  toPathCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
  toUpperCase,
} from './string'
import type { TextTransformer } from './types'

// Text transform operation types
export type TextTransformTypes =
  | 'camel'
  | 'capital'
  | 'constant'
  | 'dot'
  | 'kebab'
  | 'lower'
  | 'pascal'
  | 'path'
  | 'sentence'
  | 'snake'
  | 'title'
  | 'trim'
  | 'upper'

// Text transformer map.
export const textTransformers: Readonly<
  Record<TextTransformTypes, TextTransformer>
> = {
  camel: toCamelCase,
  capital: toCapitalCase,
  constant: toConstantCase,
  dot: toDotCase,
  kebab: toKebabCase,
  lower: toLowerCase,
  pascal: toPascalCase,
  path: toPathCase,
  sentence: toSentenceCase,
  snake: toSnakeCase,
  title: toTitleCase,
  trim: text => text.trim(),
  upper: toUpperCase,
}

/**
 * TextTransformer builder
 */
export class TextTransformerBuilder {
  protected operations: TextTransformTypes[] = []

  // Mark it need `camel` transform operation.
  public get camel(): this {
    this.operations.push('camel')
    return this
  }

  // Mark it need `capital` transform operation.
  public get capital(): this {
    this.operations.push('capital')
    return this
  }

  // Mark it need `dot` transform operation.
  public get dot(): this {
    this.operations.push('dot')
    return this
  }

  // Mark it need `kebab` transform operation.
  public get kebab(): this {
    this.operations.push('kebab')
    return this
  }

  // Mark it need `lower` transform operation.
  public get lower(): this {
    this.operations.push('lower')
    return this
  }

  // Mark it need `pascal` transform operation.
  public get pascal(): this {
    this.operations.push('pascal')
    return this
  }

  // Mark it need `path` transform operation.
  public get path(): this {
    this.operations.push('path')
    return this
  }

  // Mark it need `snake` transform operation.
  public get snake(): this {
    this.operations.push('snake')
    return this
  }

  // Mark it need trim operation.
  public get trim(): this {
    this.operations.push('trim')
    return this
  }

  // Mark it need `upper` transform operation.
  public get upper(): this {
    this.operations.push('upper')
    return this
  }

  /**
   * Create a text transformer
   * @returns
   */
  public build(): TextTransformer {
    const self = this
    const operations = self.operations.slice()
    const transformer: TextTransformer = (text: string): string => {
      let result = text
      for (const operation of operations) {
        result = textTransformers[operation](result)
      }
      return result
    }
    return transformer
  }
}
