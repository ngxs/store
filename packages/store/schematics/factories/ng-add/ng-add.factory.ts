import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependency
} from '@schematics/angular/utility/dependencies';

import { LIB_CONFIG } from '../../utils/common/lib.config';

import { NgxsPackageSchema } from './ng-add.schema';

export function ngAdd(options: NgxsPackageSchema): Rule {
  return chain([
    addNgxsPackageToPackageJson(),
    // setSchematicsAsDefault(),
    finallyLog(),
    options.skipInstall ? noop() : runNpmPackageInstall()
  ]);
}

function addNgxsPackageToPackageJson() {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info('Adding npm dependencies');
    LIB_CONFIG.forEach(({ type, version, name, overwrite }: NodeDependency) => {
      addPackageJsonDependency(host, { type, version, name, overwrite });
      context.logger.log('info', `✅️ Added "${name}" into ${type}`);
    });
    return host;
  };
}

function runNpmPackageInstall() {
  return (_: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    context.logger.log('info', `🔍 Installing packages...`);
  };
}

// function setSchematicsAsDefault(): Rule {
//   return (host: Tree, context: SchematicContext) => {
//     context.logger.info('Adding @ngxs/schematics to angular.json');
//     const exec = require('child_process').exec;
//     exec('ng config cli.defaultCollection @ngxs/schematics', () => {
//       context.logger.log('info', `✅️ Setting NGXS Schematics as default`);
//     });
//     return host;
//   };
// }

function finallyLog(): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.log(
      'info',
      `👏 Create your first ngxs store by using starter kit: ng g ngxs-sk --spec`
    );

    return host;
  };
}
