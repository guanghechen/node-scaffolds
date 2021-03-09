declare module 'postcss-flexbugs-fixes' {
  export interface Options {
    /**
     * @default true
     * @see https://github.com/luisrudge/postcss-flexbugs-fixes#bug-4
     */
    bug4?: boolean
    /**
     * @default true
     * @see https://github.com/luisrudge/postcss-flexbugs-fixes#bug-6
     */
    bug6?: boolean
    /**
     * @default true
     * @see https://github.com/luisrudge/postcss-flexbugs-fixes#bug-81a
     */
    bug8a?: boolean
  }

  export function postcssFlexbugsFixes(options?: Options): any
  export default postcssFlexbugsFixes
}
