export interface StarterKitSchema {
  /**
   * The path to create the starter kit.
   */
  path?: string;
  /**
   * The spec flag
   */
  spec?: boolean;
  /**
   * The application project name to add the Ngxs module/provider.
   */
  project?: string;
  /**
   * Explicitly set whether should generate standalone APIs for the generated starter kit.
   */
  standalone?: boolean;
}
