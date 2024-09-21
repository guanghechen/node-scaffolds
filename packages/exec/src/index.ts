import type { IReporter } from '@guanghechen/reporter.types'
import { spawn } from 'node:child_process'

export interface ISafeExecParams {
  from: string
  cmd: string
  args: string[]
  cwd?: string
  env?: Record<string, string | undefined>
  stdio?: 'pipe' | 'overlapped' | 'inherit' | 'ignore'
  encoding?: BufferEncoding
  reporter?: IReporter
}

export interface ISafeExecResult {
  stdout: string
}

export async function safeExec(params: ISafeExecParams): Promise<ISafeExecResult> {
  const { from, cmd, args, cwd, stdio, encoding = 'utf8', reporter } = params
  const env: Record<string, string | undefined> | undefined = params.env
  reporter?.debug(
    '[safeExec] {}: cmd: {}, args: {}, cwd: {}, stdio: {}, env: {}, encoding: {}',
    from,
    cmd,
    args,
    cwd,
    stdio,
    env,
    encoding,
  )

  try {
    const stdout = await new Promise<string>((resolve, reject) => {
      let stdoutData: string = ''
      let stderrData: string = ''
      let terminated: boolean = false

      const onResolved = (): void => {
        if (!terminated) {
          terminated = true
          resolve(stdoutData.trimEnd())
        }
      }

      const onRejected = (error?: unknown): void => {
        if (!terminated) {
          terminated = true
          reject(error || new Error((stderrData || stdoutData).trimEnd()))
        }
      }

      try {
        const child = spawn(cmd, args, { cwd, env, stdio })
        child.stdout!.on('data', data => {
          stdoutData += data.toString(encoding)
        })
        child.stderr!.on('data', data => {
          stderrData += data.toString(encoding)
        })
        child.on('close', code => {
          if (code === 0) onResolved()
          else onRejected()
        })
      } catch (error) {
        onRejected(error)
      }
    })

    return { stdout }
  } catch (error) {
    reporter?.error?.(
      '[safeExec] Failed to run {}: cmd: {}, args: {}, cwd: {}, stdio: {}, env: {}, encoding: {}. error:\n',
      from,
      cmd,
      args,
      cwd,
      stdio,
      env,
      encoding,
      error,
    )
    throw error
  }
}
