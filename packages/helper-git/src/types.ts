export interface IGitCommitDagNode {
  id: string
  parents: string[]
}

export interface IGitCommitInfo {
  commitId: string
  authorDate: string
  authorName: string
  authorEmail: string
  committerDate: string
  committerName: string
  committerEmail: string
  message: string
}
