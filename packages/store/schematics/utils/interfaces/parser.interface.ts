import { Rule } from '@angular-devkit/schematics';
import { Path } from '@angular-devkit/core';

export interface ParserInterface {
  nameParser(option: ParseOptions): Location;
  specParser(option: boolean): Rule;
}

export interface ParseOptions {
  name: string;
  path?: string;
}

export interface Location {
  name: string;
  path: Path;
}
