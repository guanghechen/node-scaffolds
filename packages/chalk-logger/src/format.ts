import { isFunction } from '@guanghechen/helper-is'
import JSON5 from 'json5'

export const normalizeString = (
  data: unknown | null | undefined | (() => unknown | null | undefined),
  inline: boolean,
  replacer?: ((key: string, value: any) => any) | null,
): string => {
  const message: unknown | null | undefined = isFunction(data) ? data() : data
  if (message === null) return 'null'
  if (message === undefined) return 'undefined'
  switch (typeof message) {
    case 'string':
      return inline ? message.replace(/\s*\n\s*/g, ' ') : message
    case 'boolean':
      return message ? 'true' : 'false'
    case 'number':
      return String(message)
  }
  if (message instanceof Error) return message.stack ?? message.message ?? message.name
  return inline ? JSON5.stringify(message, replacer, 0) : JSON5.stringify(message, replacer, 2)
}
