import { showCommitInfo } from '@guanghechen/helper-git'
import type { GitCipher } from '@guanghechen/helper-git-cipher'
import type { IReporter } from '@guanghechen/reporter.types'

export interface IVerifyCryptRepoParams {
  readonly catalogConfigPath: string
  readonly cryptCommitId: string
  readonly cryptRootDir: string
  readonly gitCipher: GitCipher
  readonly reporter: IReporter
}

export async function verifyCryptRepo(params: IVerifyCryptRepoParams): Promise<void> {
  const title = 'verifyCryptRepo'
  const { catalogConfigPath, cryptRootDir, gitCipher, reporter } = params

  // To avoid the `HEAD` reference.
  const cryptCommitId: string = (
    await showCommitInfo({
      commitHash: params.cryptCommitId,
      cwd: cryptRootDir,
      reporter,
    })
  ).commitId

  reporter.debug(`[${title}] cryptCommitId(${cryptCommitId}).`)

  await gitCipher.verifyCryptCommit({ catalogConfigPath, cryptCommitId })
}
