export interface ActionsSchema {
  /**
   * The name of the actions.
   */
  name: string;
  /**
   * The path to create the actions.
   */
  path?: string;
  /**
   * Flag to indicate if a dir is created.
   */
  flat?: boolean;
  /**
   * The application project name to add the Ngxs module/provider.
   */
  project?: string;
}
