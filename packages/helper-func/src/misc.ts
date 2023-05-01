export const falsy = (..._args: any[]): boolean => false
export const truthy = (..._args: any[]): boolean => true
export const identity = <T>(data: T): T => data
export const noop = (..._args: any[]): void => {}
