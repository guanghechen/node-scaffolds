/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
import copy from '@guanghechen/rollup-plugin-copy'

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  input: 'index.js',
  output: {
    dir: 'lib/esm',
    format: 'esm',
  },
  plugins: [
    copy({
      verbose: true,
      targets: [
        {
          src: 'assets/data/guanghechen/*.json',
          dest: 'dist/packs',
          rename: name => `${name}.txt`,
          transform: async function (source) {
            return 'Author: guanghechen\n' + source.toString()
          },
        },
        {
          src: 'assets/data/some-folder',
          dest: 'dist/packs',
        },
        {
          src: 'assets/data/some/**/*.json',
          dest: 'dist/packs',
        },
      ],
    }),
  ],
}
