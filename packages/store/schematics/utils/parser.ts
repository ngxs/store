import { basename, dirname, normalize, Path } from '@angular-devkit/core';
import { filter, noop, Rule } from '@angular-devkit/schematics';
import { ParserInterface, ParseOptions, Location } from './interfaces/parser.interface';

export class Parser implements ParserInterface {
  public nameParser(options: ParseOptions): Location {
    const nameWithoutPath: string = basename(options.name as Path);
    const namePath: string = dirname(
      (options.path === undefined ? '' : options.path).concat('/').concat(options.name) as Path
    );
    return {
      name: nameWithoutPath,
      path: normalize('/'.concat(namePath))
    };
  }

  public specParser(option: boolean): Rule {
    return option ? noop() : filter(path => !path.includes('spec'));
  }
}
