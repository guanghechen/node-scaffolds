import crypto from 'crypto'
import { destroyBuffer } from '../buffer'
import type { CustomError } from '../events'
import { ErrorCode } from '../events'
import { input } from './input'

/**
 *
 * @param question           Question to ask for input password
 * @param showAsterisk       Whether to print asterisks when entering a password
 * @param maxInputRetryTimes Max retry times due to the bad input
 * @param minimumSize        Minimum length of password
 * @param maximumSize        Maximum length of password
 */
export async function inputPassword(
  question: string,
  showAsterisk: boolean,
  maxInputRetryTimes = 3,
  minimumSize = -1,
  maximumSize = -1,
): Promise<Buffer> {
  let hint: string
  const isValidPassword = (password: Buffer | null): boolean => {
    if (
      password == null ||
      (minimumSize > 0 && password.length < minimumSize)
    ) {
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

  const password: Buffer | null = await input(
    question.padStart(20),
    isValidPassword,
    isValidCharacter,
    () => `(${hint}) ${question}`,
    maxInputRetryTimes,
    showAsterisk,
  )

  if (password == null) {
    const error: CustomError = {
      code: ErrorCode.BAD_PASSWORD,
      message:
        'too many times failed to get answer of ' +
        `'${question.replace(/^[\s:]*([\s\S]+?)[\s:]*$/, '$1')}'`,
    }
    throw error
  }

  // Perform a hash operation on the password
  const sha1 = crypto.createHash('sha1')
  sha1.update(password)
  const hashedPassword = sha1.digest()
  destroyBuffer(password)
  return hashedPassword
}

/**
 * Ask for repeat password from terminal
 * @param password       The password entered earlier
 * @param question       Question to ask for input password
 * @param showAsterisk   Whether to print asterisks when entering a password
 * @param minimumSize    Minimum length of password
 * @param maximumSize    Maximum length of password
 */
export async function confirmPassword(
  password: Buffer,
  question = 'Repeat Password: ',
  showAsterisk: boolean,
  minimumSize = -1,
  maximumSize = -1,
): Promise<boolean | never> {
  const repeatedPassword: Buffer = await inputPassword(
    question,
    showAsterisk,
    1,
    minimumSize,
    maximumSize,
  )
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
