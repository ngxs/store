export interface Schema {
  /** Whether to skip package.json install. */
  skipPackageJson: boolean;

  /** Name of the project to target. */
  project?: string;
}
