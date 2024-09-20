import { identity } from '@guanghechen/helper-func'
import { isArray, isNumber, isObject, isString } from '@guanghechen/is'
import type { IDesensitizer, INumberDesensitizer, IStringDesensitizer } from './types'

/**
 * Create a desensitizer to eliminate sensitive json data.
 * @param valDesensitizers  Desensitizers for values of object
 * @param keyDesensitizer   Desensitizer for keys of object
 * @returns
 */
export function createJsonDesensitizer(
  valDesensitizers: {
    string?: IStringDesensitizer
    number?: INumberDesensitizer
    fallback?: IDesensitizer<unknown>
  } = {},
  keyDesensitizer?: IStringDesensitizer,
): IDesensitizer<unknown> {
  const fallback: IDesensitizer<unknown> =
    valDesensitizers.fallback == null ? identity : valDesensitizers.fallback
  const desensitizers = {
    key: keyDesensitizer == null ? (identity as IStringDesensitizer) : keyDesensitizer,
    string:
      valDesensitizers.string == null ? (fallback as IStringDesensitizer) : valDesensitizers.string,
    number:
      valDesensitizers.number == null ? (fallback as INumberDesensitizer) : valDesensitizers.number,
    fallback,
  }

  const desensitize = (json: any, key?: string): any => {
    if (isString(json)) return desensitizers.string(json, key)
    if (isNumber(json)) return desensitizers.number(json, key)
    if (isArray(json)) {
      return json.map((value, index) => desensitize(value, '' + index))
    }
    if (isObject(json)) {
      const results: Record<string, unknown> = {}
      for (const _key of Object.keys(json)) {
        const key: string = desensitizers.key(_key)
        results[key] = desensitize(json[_key as keyof typeof json], _key)
      }
      return results
    }
    return desensitizers.fallback(json)
  }
  return desensitize
}
