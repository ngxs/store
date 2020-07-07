export interface StoreSchema {
  /**
   * The name of the store.
   */
  name: string;
  /**
   * The path to create the store.
   */
  path?: string;
  /**
   * The source root path
   */
  sourceRoot?: string;
  /**
   * The spec flag
   */
  spec?: boolean;
}
