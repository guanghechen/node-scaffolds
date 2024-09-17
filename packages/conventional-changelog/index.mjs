import { recommendedBumpOpts } from './opts/bump.mjs'
import { parserOpts } from './opts/parser.mjs'
import { writerOpts as writerOptsPromise } from './opts/writer.mjs'

const presetConfig = buildPresetConfig()
export default presetConfig

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
