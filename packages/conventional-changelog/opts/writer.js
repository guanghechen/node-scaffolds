/* eslint-disable no-param-reassign */
const { readFile } = require('node:fs/promises')
const path = require('node:path')

const boilerplateRootDir = path.join(__dirname, '../boilerplates')
const resolveTemplateFilepath = (...filepath) => {
  const abFilepath = path.resolve(boilerplateRootDir, ...filepath)
  return readFile(abFilepath, 'utf-8')
}

module.exports.writerOpts = Promise.all([
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

function getWriterOpts() {
  return {
    transform: (commit, context) => {
      let discard = true
      const issues = []

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
