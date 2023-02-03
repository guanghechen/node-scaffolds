import { showCommitInfo } from '../src/command/view'
import type { IGitCommandBaseParams } from '../src/types'
import type { ICommitItem } from './_data-repo1'

export const assertAtCommit = async (
  ctx: IGitCommandBaseParams,
  commit: ICommitItem,
): Promise<void> => {
  const expectedInfo = await showCommitInfo({ ...ctx, branchOrCommitId: commit.commitId })
  const headInfo = await showCommitInfo({ ...ctx, branchOrCommitId: 'HEAD' })
  expect(expectedInfo).toEqual({
    commitId: commit.commitId,
    authorDate: commit.authorDate,
    authorName: commit.authorName,
    authorEmail: commit.authorEmail,
    committerDate: commit.committerDate,
    committerName: commit.committerName,
    committerEmail: commit.committerEmail,
    message: commit.message,
  })
  expect(headInfo).toEqual(expectedInfo)
}
