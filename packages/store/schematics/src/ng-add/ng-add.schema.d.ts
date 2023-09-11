export interface NgxsPackageSchema {
  /**
   * The flag for skipping packages installation.
   */
  skipInstall?: boolean;
  /**
   * Additonal packages to be added to the workspace.
   */
  plugins?: string[];
  /**
   * The application project name to add the Ngxs module import to.
   */
  project?: string;
}
