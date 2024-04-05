import { Tree } from '@angular-devkit/schematics';

export interface PackageToJsonInterface {
  host: Tree;
  type: string;
  pkg: string;
  version: string;
}
