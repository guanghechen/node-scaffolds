/* eslint-disable no-param-reassign */
import { gitmojis } from 'gitmojis'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

interface ICommit {
  type: 'feat' | string
  hash: string
  notes: Array<{ title: string }>
  references: Array<{ issue: string }>
  shortHash?: string
  subject?: string
  scope?: string
  gitmoji?: string
  revert?: boolean
}

interface IWriteTransformContext {
  host?: string
  repoUrl?: string
  repository?: string
  owner?: string
}

const boilerplateRootDir: string = path.join(__dirname, '../../boilerplates')
const resolveTemplateFilepath = (...filepath: string[]): Promise<string> => {
  const abFilepath = path.resolve(boilerplateRootDir, ...filepath)
  return readFile(abFilepath, 'utf-8')
}

export const parserOpts = {
  headerPattern: /^\s*(?:(:\w+:)\s)?\s*(\w*)(?:\((.*)\))?: (.*)$/,
  headerCorrespondence: ['gitmoji', 'type', 'scope', 'subject'],
  issuePrefixes: ['#'],
  noteKeywords: ['BREAKING CHANGE'],
  referenceActions: [
    'close',
    'closes',
    'closed',
    'fix',
    'fixes',
    'fixed',
    'resolve',
    'resolves',
    'resolved',
  ],
  revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
  revertCorrespondence: ['header', 'hash'],
}

export const recommendedBumpOpts = {
  parserOpts,
  whatBump: (commits: ICommit[]) => {
    let level = 2
    let breakings = 0
    let features = 0

    commits.forEach(commit => {
      if (commit.notes.length > 0) {
        breakings += commit.notes.length
        level = 0
      } else if (commit.type === 'feat') {
        features += 1
        if (level === 2) {
          level = 1
        }
      }
    })

    return {
      level: level,
      reason:
        breakings === 1
          ? `There is ${breakings} BREAKING CHANGE and ${features} features`
          : `There are ${breakings} BREAKING CHANGES and ${features} features`,
    }
  },
}

export const writerOpts = Promise.all([
  resolveTemplateFilepath('./template.hbs'),
  resolveTemplateFilepath('./header.hbs'),
  resolveTemplateFilepath('./commit.hbs'),
  resolveTemplateFilepath('./footer.hbs'),
]).then(([template, header, commit, footer]) => ({
  ...getWriterOpts(),
  mainTemplate: template,
  headerPartial: header,
  commitPartial: commit,
  footerPartial: footer,
}))

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getWriterOpts() {
  return {
    transform: (commit: ICommit, context: IWriteTransformContext) => {
      let discard: boolean = true
      const issues: string[] = []

      // Replace gitmoji code to emoji.
      if (typeof commit.gitmoji === 'string') {
        const gitmoji = gitmojis.find(emoji => emoji.code === commit.gitmoji)
        if (gitmoji) {
          commit.gitmoji = gitmoji.emoji
        }
      }

      if (Array.isArray(commit.notes)) {
        for (const note of commit.notes) {
          note.title = 'BREAKING CHANGES'
          discard = false
        }
      }

      const commitType = typeof commit.type === 'string' ? commit.type.toLowerCase() : ''

      if (/^feat|feature$/.test(commitType)) commit.type = 'Features'
      else if (commitType === 'fix') commit.type = 'Bug Fixes'
      else if (/^perf|performance|improve$/.test('perf')) commit.type = 'Performance Improvements'
      else if (commitType === 'revert' || commit.revert) commit.type = 'Reverts'
      else if (discard) return
      else if (/^doc|docs$/.test(commitType)) commit.type = 'Documentation'
      else if (commitType === 'style') commit.type = 'Styles'
      else if (commitType === 'refactor') commit.type = 'Code Refactoring'
      else if (commitType === 'test') commit.type = 'Tests'
      else if (commitType === 'build') commit.type = 'Build System'
      else if (commitType === 'ci') commit.type = 'Continuous Integration'

      if (commit.scope === '*') commit.scope = ''
      if (typeof commit.hash === 'string') commit.shortHash = commit.hash.substring(0, 7)

      if (typeof commit.subject === 'string') {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl
        if (url) {
          url = `${url}/issues/`
          // Issue URLs.
          commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue)
            return `[#${issue}](${url}${issue})`
          })
        }
        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replace(
            /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
            (_, username) =>
              username.includes('/')
                ? `@${username}`
                : `[@${username}](${context.host}/${username})`,
          )
        }
      }

      // remove references that already appear in the subject
      commit.references = commit.references.filter(reference => !issues.includes(reference.issue))
      return commit
    },
    groupBy: 'type',
    commitGroupsSort: 'title',
    commitsSort: ['scope', 'subject'],
    noteGroupsSort: 'title',
    notesSort: 'text',
  }
}
