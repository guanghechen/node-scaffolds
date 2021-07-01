import { isNonBlankString } from '@guanghechen/option-helper'
import { destroyBuffer } from '../buffer'
import { EventTypes, eventBus } from '../events'

/**
 * @param question
 * @param isValidCharacter
 * @param showAsterisk
 */
export function inputOneLine(
  question?: string,
  isValidCharacter?: (c: number) => boolean,
  showAsterisk = true,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const stdin = process.stdin
    const stdout = process.stdout
    let chunkAcc: Buffer | null = null

    // on fulfilled
    const onResolved = (): void => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      stdin.removeListener('data', onData)
      stdin.removeListener('end', onResolved)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      stdin.removeListener('error', onRejected)
      resolve(chunkAcc!)
    }

    // on rejected
    const onRejected = (error: unknown): void => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      stdin.removeListener('data', onData)
      stdin.removeListener('end', onResolved)
      stdin.removeListener('error', onRejected)
      destroyBuffer(chunkAcc)
      reject(error)
    }

    // on data
    const onData = (chunk: Buffer): void => {
      let pieceTot: number = chunkAcc == null ? 0 : chunkAcc.length
      const piece: Buffer =
        chunkAcc == null ? chunk : Buffer.concat([chunkAcc, chunk])
      for (let i = 0; i < chunk.length; ++i) {
        switch (chunk[i]) {
          case 0x03: // Ctrl-c
            eventBus.dispatch({ type: EventTypes.CANCELED })
            return
          case 0x7f: // Backspace
            if (pieceTot > 0) {
              pieceTot -= 1
              stdout.moveCursor(-1, 0)
              stdout.clearLine(1)
            }
            break
          case 0x04: // Ctrl-d
          case 0x0a: // LF  (line feed)
          case 0x0d: // CR  (carriage return)
            stdout.write('\n')
            stdin.setRawMode(false)
            stdin.pause()
            onResolved()
            return
          default:
            // ignore other invalid characters
            if (isValidCharacter != null && !isValidCharacter(chunk[i])) break

            piece[pieceTot] = chunk[i]
            pieceTot += 1

            if (showAsterisk) {
              stdout.write('*')
            }
        }
      }

      if (pieceTot <= 0) {
        destroyBuffer(chunkAcc)
        chunkAcc = null
      }

      // collect characters
      if (chunkAcc == null || chunkAcc.length !== pieceTot) {
        destroyBuffer(chunkAcc)
        chunkAcc = Buffer.alloc(pieceTot)
      }
      piece.copy(chunkAcc, 0, 0, pieceTot)
      destroyBuffer(piece)
    }

    stdin.resume()
    stdin.setRawMode(true)
    if (isNonBlankString(question)) {
      stdout.write(question)
    }

    stdin.on('data', onData)
    stdin.on('end', onResolved)
    stdin.on('error', onRejected)
  })
}

/**
 * Get data from stdin
 * @param question
 * @param isValidAnswer
 * @param hintOnInvalidAnswer
 * @param maxRetryTimes
 * @param showAsterisk
 */
export async function input(
  question: string,
  isValidAnswer?: (answer: Buffer | null) => boolean,
  isValidCharacter?: (c: number) => boolean,
  hintOnInvalidAnswer?: (answer: Buffer | null) => string,
  maxRetryTimes = 3,
  showAsterisk = true,
): Promise<Buffer | null> {
  let answer: Buffer | null = null
  for (let i = 0, end = Math.max(0, maxRetryTimes) + 1; i < end; ++i) {
    let questionWithHint: string = question
    if (i > 0 && hintOnInvalidAnswer != null) {
      const hint = hintOnInvalidAnswer(answer)
      if (isNonBlankString(hint)) {
        questionWithHint = hint
      }
    }

    // destroy previous answer before read new answer
    destroyBuffer(answer)
    answer = null

    answer = await inputOneLine(
      questionWithHint,
      isValidCharacter,
      showAsterisk,
    )
    if (!isValidAnswer || isValidAnswer(answer)) break
  }
  return answer
}
