import { destroyBuffer } from '@guanghechen/helper-buffer'
import { calcMac } from '@guanghechen/helper-mac'
import type { ICustomError } from '../core/error'
import { ErrorCode } from '../core/error'
import { inputAnswer } from './input'

interface IInputPasswordParams {
  /**
   * Question to ask for input password.
   */
  question: string
  /**
   * Whether to print asterisks when entering a password.
   */
  showAsterisk: boolean
  /**
   * Max retry times due to the bad input.
   */
  maxInputRetryTimes?: number
  /**
   * Minimum length of password.
   */
  minimumSize?: number
  /**
   * Maximum length of password.
   */
  maximumSize?: number
}

export async function inputPassword({
  question,
  showAsterisk,
  maxInputRetryTimes = 3,
  minimumSize = -1,
  maximumSize = -1,
}: IInputPasswordParams): Promise<Buffer> {
  let hint: string
  const isValidPassword = (password: Buffer | null): boolean => {
    if (password == null || (minimumSize > 0 && password.length < minimumSize)) {
      hint = `At least ${minimumSize} ascii non-space characters needed`
      return false
    }
    if (maximumSize >= minimumSize && password.length > maximumSize) {
      hint = "It's too long, do not exceed 100 characters"
      return false
    }
    return true
  }

  const isValidCharacter = (c: number): boolean => {
    // ignore control characters or invalid ascii characters
    if (c <= 0x20 || c >= 0x7f) return false

    // ignore slash and backslash
    if (c === 0x2f || c === 0x5c) return false

    // others are valid
    return true
  }

  const password: Buffer | null = await inputAnswer({
    question: question.padStart(20),
    maxRetryTimes: maxInputRetryTimes,
    showAsterisk,
    isValidAnswer: isValidPassword,
    isValidCharacter,
    hintOnInvalidAnswer: () => `(${hint}) ${question}`,
  })

  if (password == null) {
    const error: ICustomError = {
      code: ErrorCode.BAD_PASSWORD,
      message:
        'too many times failed to get answer of ' +
        `'${question.replace(/^[\s:]*([\s\S]+?)[\s:]*$/, '$1')}'`,
    }
    throw error
  }

  // Perform a hash operation on the password
  const hashedPassword: Buffer = calcMac([password], 'sha256')
  destroyBuffer(password)
  return hashedPassword
}

export interface IConfirmPasswordParams {
  /**
   * The password entered earlier
   */
  password: Buffer
  /**
   * Question to ask for input password
   */
  question?: string
  /**
   * Whether to print asterisks when entering a password
   */
  showAsterisk?: boolean
  /**
   * Minimum length of password
   */
  minimumSize?: number
  /**
   * Maximum length of password
   */
  maximumSize?: number
}

export async function confirmPassword({
  password,
  showAsterisk = true,
  question = 'Repeat Password: ',
  minimumSize = -1,
  maximumSize = -1,
}: IConfirmPasswordParams): Promise<boolean | never> {
  const repeatedPassword: Buffer = await inputPassword({
    question,
    showAsterisk,
    maxInputRetryTimes: 1,
    minimumSize,
    maximumSize,
  })
  const isSame = (): boolean => {
    if (repeatedPassword.length !== password.length) return false
    for (let i = 0; i < password.length; ++i) {
      if (password[i] !== repeatedPassword[i]) return false
    }
    return true
  }

  const result = isSame()
  destroyBuffer(repeatedPassword)
  return result
}
