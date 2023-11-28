import { destroyBytes } from '@guanghechen/byte'
import { calcMac } from '@guanghechen/mac'
import { CustomErrorCode } from '../../core/constant'
import type { ICustomError } from '../../core/error'
import type { IInputAnswer } from '../input/answer'

interface IParams {
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
  inputAnswer: IInputAnswer
}

export async function inputPassword(params: IParams): Promise<Readonly<Uint8Array>> {
  const {
    question,
    showAsterisk,
    maxInputRetryTimes = 3,
    minimumSize = -1,
    maximumSize = -1,
    inputAnswer,
  } = params

  let hint: string
  const isValidPassword = (password: Readonly<Uint8Array> | null): boolean => {
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

  const password: Uint8Array | null = await inputAnswer({
    question: question.padStart(20),
    maxRetryTimes: maxInputRetryTimes,
    showAsterisk,
    isValidAnswer: isValidPassword,
    isValidChar: isValidCharacter,
    hintOnInvalidAnswer: () => `(${hint}) ${question}`,
  })

  if (password == null) {
    const error: ICustomError = {
      code: CustomErrorCode.BAD_PASSWORD,
      message:
        'too many times failed to get answer of ' +
        `'${question.replace(/^[\s:]*([\s\S]+?)[\s:]*$/, '$1')}'`,
    }
    throw error
  }

  // Perform a hash operation on the password
  const hashedPassword: Uint8Array = calcMac([password], 'sha256')
  destroyBytes(password)
  return hashedPassword
}
