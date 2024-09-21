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
  const env: Record<string, string | undefined> = { ...process.env, ...params.env }
  reporter?.debug(
    '[safeExec] {}: cmd: {}, args: {}, cwd: {}, env: {}, encoding: {}',
    from,
    cmd,
    args,
    cwd,
    env,
    encoding,
  )

  try {
    const stdout: string = await new Promise<string>((resolve, reject) => {
      const command = spawn(cmd, args, { cwd, env, stdio })

      let stdoutData: string = ''
      let stderrData: string = ''

      command.stdout!.on('data', data => {
        stdoutData += data.toString(encoding)
      })

      command.stderr!.on('data', data => {
        stderrData += data.toString(encoding)
      })

      command.on('close', code => {
        if (code === 0) resolve(stdoutData)
        else reject(stderrData)
      })
    })

    const result: ISafeExecResult = { stdout }
    return result
  } catch (error) {
    reporter?.error?.('[safeExec] failed to run {}, (args: {}, params: {})', cmd, args, params)
    throw error
  }
}
