import { apply, move, Source, template, url } from '@angular-devkit/schematics';
import { join, Path } from '@angular-devkit/core';
import * as strings from '@angular-devkit/core/src/utils/strings';
import { GenerateFactoryInterface } from './interfaces/generate-factory.interface';
import { Parser } from './parser';

export function generate({ options, factory }: Partial<GenerateFactoryInterface>): Source {
  const parser: Parser = new Parser();
  return apply(url(join('../../templates' as Path, factory)), [
    parser.specParser(options.spec),
    template({
      ...strings,
      ...options
    }),
    move(options.path)
  ]);
}
