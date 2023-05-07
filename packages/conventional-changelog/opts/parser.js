module.exports.parserOpts = {
  headerPattern: /^(:\w+:\s)?\s*(\w*)(?:\((.*)\))?: (.*)$/,
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
