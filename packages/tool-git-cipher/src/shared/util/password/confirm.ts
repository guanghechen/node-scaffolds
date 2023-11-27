import { destroyBytes } from '@guanghechen/byte'
import type { IEventBus } from '@guanghechen/event-bus'
import type { EventTypes } from '../../core/constant'
import { inputPassword } from './input'

interface IParams {
  eventBus: IEventBus<EventTypes>
  /**
   * The password entered earlier
   */
  password: Readonly<Uint8Array>
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

export async function confirmPassword(params: IParams): Promise<boolean | never> {
  const {
    eventBus,
    password,
    showAsterisk = true,
    question = 'Repeat Password: ',
    minimumSize = -1,
    maximumSize = -1,
  } = params

  let valid: boolean = false
  let repeatedPassword: Uint8Array | undefined

  try {
    repeatedPassword = await inputPassword({
      eventBus,
      question,
      showAsterisk,
      maxInputRetryTimes: 1,
      minimumSize,
      maximumSize,
    })
    const isSame = (): boolean => {
      if (repeatedPassword === undefined) return false
      if (repeatedPassword.length !== password.length) return false
      for (let i = 0; i < password.length; ++i) {
        if (password[i] !== repeatedPassword[i]) return false
      }
      return true
    }

    valid = isSame()
  } finally {
    if (repeatedPassword !== undefined) {
      destroyBytes(repeatedPassword)
    }
  }
  return valid
}
