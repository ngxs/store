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
   * The source root path
   */
  sourceRoot?: string;
  /**
   * The spec flag
   */
  spec?: boolean;
}
