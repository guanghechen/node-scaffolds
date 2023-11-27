import { destroyBytes } from '@guanghechen/byte'
import type { IEventBus } from '@guanghechen/event-bus'
import { isNonBlankString } from '@guanghechen/helper-is'
import type { EventTypes } from '../../core/constant'
import { inputLineFromTerminal } from './line'

export interface IInputAnswerParams {
  eventBus: IEventBus<EventTypes>
  question: string
  maxRetryTimes?: number
  showAsterisk?: boolean
  isValidAnswer?(answer: Uint8Array | null): boolean
  isValidChar?(c: number): boolean
  hintOnInvalidAnswer?(answer: Uint8Array | null): string
}

export type IInputAnswer = (params: IInputAnswerParams) => Promise<Uint8Array | null>

export const inputAnswerFromTerminal: IInputAnswer = async params => {
  const {
    eventBus,
    question,
    maxRetryTimes = 3,
    showAsterisk = true,
    isValidAnswer,
    isValidChar,
    hintOnInvalidAnswer,
  } = params

  let answer: Uint8Array | null = null
  for (let i = 0, end = Math.max(0, maxRetryTimes) + 1; i < end; ++i) {
    let questionWithHint: string = question
    if (i > 0 && hintOnInvalidAnswer != null) {
      const hint = hintOnInvalidAnswer(answer)
      if (isNonBlankString(hint)) {
        questionWithHint = hint
      }
    }

    // destroy previous answer before read new answer
    if (answer) destroyBytes(answer)

    answer = await inputLineFromTerminal({
      eventBus,
      question: questionWithHint,
      isValidChar: isValidChar,
      showAsterisk,
    })
    if (!isValidAnswer || isValidAnswer(answer)) break
  }
  return answer
}
