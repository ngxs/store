import {
  chain,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
  NodeDependency
} from '@schematics/angular/utility/dependencies';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { getProject } from '@schematics/angular/utility/project';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';

import { LIBRARIES, LIB_CONFIG } from '../../utils/common/lib.config';

import { NgxsPackageSchema } from './ng-add.schema';
import { InsertChange } from '@schematics/angular/utility/change';
import * as ts from '@schematics/angular/node_modules/typescript';

export function ngAdd(options: NgxsPackageSchema): Rule {
  return chain([
    addNgxsPackageToPackageJson(options),
    finallyLog(),
    options.skipInstall ? noop() : runNpmPackageInstall(),
    options.skipInstall ? noop() : addDeclarationToNgModule(options)
  ]);
}

function addNgxsPackageToPackageJson(options: NgxsPackageSchema) {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info('Adding npm dependencies');
    LIB_CONFIG.filter(
      lib => lib.name === LIBRARIES.STORE || options.packages?.includes(lib.name)
    ).forEach(({ type, version, name, overwrite }: NodeDependency) => {
      const packageExists = getPackageJsonDependency(host, name);
      if (packageExists === null) {
        addPackageJsonDependency(host, { type, version, name, overwrite });
        context.logger.info(`✅️ Added "${name}" into ${type}`);
      } else {
        context.logger.warn(`✅️ "${name}" already exists in the ${type}`);
      }
    });
    return host;
  };
}

function runNpmPackageInstall() {
  return (_: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    context.logger.info(`🔍 Installing packages...`);
  };
}

function finallyLog(): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info(
      `👏 Create your first ngxs store by using starter kit: ng g ngxs-sk --spec`
    );

    return host;
  };
}

function addDeclarationToNgModule(options: NgxsPackageSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (typeof options.name === 'undefined' || options.name === '') {
      return host;
    }

    const project = getProject(host, options.name);

    context.logger.info(JSON.stringify(project));

    if (typeof project === 'undefined' || project === null) {
      throw new SchematicsException(`Project "${options.name}" does not exist.`);
    }

    const modulePath = getAppModulePath(host, `${project.root}/src/main.ts`);

    context.logger.info(`module path, ${modulePath}`);

    if (typeof modulePath === 'undefined') {
      throw new SchematicsException(
        `Module path for project "${options.name}" does not exist.`
      );
    }

    const importPath = '@ngxs/store';

    const moduleImport =
      'NgxsModule.forRoot([], {developmentMode: !environment.production,selectorOptions: {suppressErrors: false,injectContainerState: false}})';

    const sourceBuffer = host.read(modulePath);

    if (sourceBuffer !== null) {
      const sourceText = sourceBuffer.toString();
      const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

      const changes = addImportToModule(source, modulePath, moduleImport, importPath);

      const recorder = host.beginUpdate(modulePath);
      for (const change of changes) {
        if (change instanceof InsertChange) {
          recorder.insertLeft(change.pos, change.toAdd);
        }
      }
      host.commitUpdate(recorder);
    }

    return host;
  };
}
