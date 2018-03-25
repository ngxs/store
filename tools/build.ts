'use strict';

import { resolve } from 'path';
import { ngPackagr } from 'ng-packagr';

export default m => {
  const project = resolve(__dirname, '../', m, 'ng-package.json');
  const tsconfig = resolve(__dirname, '../tsconfig.build.json');

  return ngPackagr()
    .forProject(project)
    .withTsConfig(tsconfig)
    .build()
    .catch(err => process.exit(111));
};
