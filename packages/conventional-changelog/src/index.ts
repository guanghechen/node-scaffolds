import { parserOpts, recommendedBumpOpts, writerOpts as writerOptsPromise } from './opts'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

const presetConfig: any = buildPresetConfig()
export default presetConfig
