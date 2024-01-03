export enum FileChangeTypeEnum {
  ADDED = 'added',
  MODIFIED = 'modified',
  REMOVED = 'removed',
}

export enum CatalogItemChangeType {
  RESET = 'reset',
  APPLY_DIFF = 'apply-diff',
}

export enum CatalogItemFlagEnum {
  /**
   * No special flags.
   */
  NONE = 0,
  /**
   * Whether if keep the source file plain.
   */
  KEEP_PLAIN = 1 << 0,
  /**
   * Whether if keep the source file integrity, don't split it even its size is exceed the limit.
   */
  KEEP_INTEGRITY = 1 << 1,
}
