export type IDesensitizer<T> = (data: Readonly<T>, key?: string) => T

/**
 * Desensitize number type values.
 */
export type INumberDesensitizer = IDesensitizer<number>

/**
 * Desensitize string type values.
 */
export type IStringDesensitizer = IDesensitizer<string>

/**
 * Desensitize object type values
 */
export type IObjectDesensitizer<T extends object = object> = IDesensitizer<T>
