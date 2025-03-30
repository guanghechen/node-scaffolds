export interface IESLintConfigParams {
  readonly tsconfigPath?: string | undefined
}

export interface IESLintConfig {
  readonly files?: string[] | undefined
  readonly rules?: Readonly<Linter.RulesRecord> | undefined
}

export function genConfigs(params?: IESLintConfigParams): IESLintConfig[]
