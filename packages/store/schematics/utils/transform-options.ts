import { join, normalize, Path } from '@angular-devkit/core';
import { Location } from './interfaces/parser.interface';
import { Parser } from './parser';
import * as strings from '@angular-devkit/core/src/utils/strings';

export function transform<T>(options: T | any) {
  const target: T = Object.assign({}, options);
  const defaultSourceRoot = options.sourceRoot !== undefined ? options.sourceRoot : 'src';
  setOptionsValue(target, defaultSourceRoot);

  return target;
}

function setOptionsValue(target, defaultSourceRoot: string) {
  target.path =
    target.path !== undefined
      ? join(normalize(defaultSourceRoot), target.path)
      : normalize(defaultSourceRoot);

  if (target.name) {
    const location: Location = new Parser().nameParser(target);
    target.name = strings.dasherize(location.name);
    target.path = join(strings.dasherize(location.path) as Path, target.name);
  }

  return target;
}
