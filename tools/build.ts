'use strict';

import { resolve } from 'path';
import { ngPackagr } from 'ng-packagr';

export default m => {
  const project = resolve(__dirname, '../', m, 'ng-package.json');

  return ngPackagr()
    .forProject(project)
    .build()
    .catch(err => process.exit(111));
};
