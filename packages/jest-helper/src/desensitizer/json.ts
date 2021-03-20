import {
  isArray,
  isNumber,
  isObject,
  isString,
} from '@guanghechen/option-helper'
import { noop } from '../util'
import type {
  Desensitizer,
  NumberDesensitizer,
  StringDesensitizer,
} from './types'

/**
 * Create a desensitizer to eliminate sensitive json data.
 * @param valDesensitizers  Desensitizers for values of object
 * @param keyDesensitizer   Desensitizer for keys of object
 * @returns
 */
export function createJsonDesensitizer(
  valDesensitizers: {
    string?: StringDesensitizer
    number?: NumberDesensitizer
    fallback?: Desensitizer<unknown>
  } = {},
  keyDesensitizer?: StringDesensitizer,
): Desensitizer<unknown> {
  const fallback: Desensitizer<unknown> =
    valDesensitizers.fallback == null ? noop : valDesensitizers.fallback
  const desensitizers = {
    key:
      keyDesensitizer == null ? (noop as StringDesensitizer) : keyDesensitizer,
    string:
      valDesensitizers.string == null
        ? (fallback as StringDesensitizer)
        : valDesensitizers.string,
    number:
      valDesensitizers.number == null
        ? (fallback as NumberDesensitizer)
        : valDesensitizers.number,
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
        results[key] = desensitize(json[_key], _key)
      }
      return results
    }
    return desensitizers.fallback(json)
  }
  return desensitize
}
