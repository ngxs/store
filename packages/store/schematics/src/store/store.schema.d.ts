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
   * The spec flag
   */
  spec?: boolean;
  /**
   * Flag to indicate if a dir is created.
   */
  flat?: boolean;
}
