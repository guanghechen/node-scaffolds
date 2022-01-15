export type Desensitizer<T> = (data: Readonly<T>, key?: string) => T

/**
 * Desensitize number type values.
 */
export type NumberDesensitizer = Desensitizer<number>

/**
 * Desensitize string type values.
 */
export type StringDesensitizer = Desensitizer<string>

/**
 * Desensitize object type values
 */
export type ObjectDesensitizer<T extends Record<string, unknown> = Record<string, unknown>> =
  Desensitizer<T>
