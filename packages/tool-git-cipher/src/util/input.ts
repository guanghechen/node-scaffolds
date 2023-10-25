import { destroyBytes, mergeBytes } from '@guanghechen/byte'
import { isNonBlankString } from '@guanghechen/helper-is'
import { EventTypes, eventBus } from '../core/event'

export interface IInputSingleLineParams {
  question?: string
  showAsterisk?: boolean
  isValidCharacter?(c: number): boolean
}

export function inputSingleLine({
  question,
  isValidCharacter,
  showAsterisk = true,
}: IInputSingleLineParams): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    const stdin = process.stdin
    const stdout = process.stdout
    let chunkAcc: Uint8Array | null = null

    // on fulfilled
    const onResolved = (): void => {
      stdin.removeListener('data', onData)
      stdin.removeListener('end', onResolved)
      stdin.removeListener('error', onRejected)
      resolve(chunkAcc!)
    }

    // on rejected
    const onRejected = (error: unknown): void => {
      stdin.removeListener('data', onData)
      stdin.removeListener('end', onResolved)
      stdin.removeListener('error', onRejected)
      if (chunkAcc) destroyBytes(chunkAcc)
      reject(error)
    }

    // on data
    const onData = (chunk: Uint8Array): void => {
      let pieceTot: number = chunkAcc == null ? 0 : chunkAcc.length
      const piece: Uint8Array = chunkAcc == null ? chunk : mergeBytes([chunkAcc, chunk])
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
        if (chunkAcc) destroyBytes(chunkAcc)
        chunkAcc = null
      }

      // collect characters
      if (chunkAcc == null || chunkAcc.length !== pieceTot) {
        if (chunkAcc) destroyBytes(chunkAcc)
        chunkAcc = new Uint8Array(pieceTot)
      }

      for (let i = 0; i < pieceTot; ++i) chunkAcc[i] = piece[i]
      destroyBytes(piece)
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

export interface IInputAnswerParams {
  question: string
  maxRetryTimes?: number
  showAsterisk?: boolean
  isValidAnswer?(answer: Uint8Array | null): boolean
  isValidCharacter?(c: number): boolean
  hintOnInvalidAnswer?(answer: Uint8Array | null): string
}
export async function inputAnswer({
  question,
  maxRetryTimes = 3,
  showAsterisk = true,
  isValidAnswer,
  isValidCharacter,
  hintOnInvalidAnswer,
}: IInputAnswerParams): Promise<Uint8Array | null> {
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

    answer = await inputSingleLine({
      question: questionWithHint,
      isValidCharacter,
      showAsterisk,
    })
    if (!isValidAnswer || isValidAnswer(answer)) break
  }
  return answer
}
