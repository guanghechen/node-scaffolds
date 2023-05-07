const { recommendedBumpOpts } = require('./opts/bump')
const { parserOpts } = require('./opts/parser')
const { writerOpts: writerOptsPromise } = require('./opts/writer')

module.exports = buildPresetConfig()

async function buildPresetConfig() {
  const writerOpts = await writerOptsPromise
  const conventionalChangelog = { parserOpts, writerOpts }
  return {
    conventionalChangelog,
    parserOpts,
    recommendedBumpOpts,
    writerOpts,
  }
}
