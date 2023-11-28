import { type CustomErrorCode, CustomErrorCodeList } from './constant'

export interface ICustomError {
  code: CustomErrorCode
  message: string
}

export class CustomError extends Error implements ICustomError {
  public readonly code: CustomErrorCode

  constructor(code: CustomErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

export function isCustomError(error: unknown): error is ICustomError {
  if (error instanceof CustomError) return true
  if (typeof error === 'object' && error !== null) {
    const e = error as ICustomError
    return CustomErrorCodeList.includes(e.code)
  }
  return false
}
