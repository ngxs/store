export interface StateSchema {
  /**
   * The name of the state.
   */
  name: string;
  /**
   * The path to create the state.
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
