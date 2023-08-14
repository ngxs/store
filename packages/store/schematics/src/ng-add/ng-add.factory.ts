import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  chain,
  noop
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import {
  NodeDependencyType,
  addPackageJsonDependency,
  getPackageJsonDependency
} from '@schematics/angular/utility/dependencies';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';

import { LIBRARIES } from '../utils/common/lib.config';
import { getProject } from '../utils/project';

import { NgxsPackageSchema } from './ng-add.schema';

const versions = require('./../utils/versions.json');

export function ngAdd(options: NgxsPackageSchema): Rule {
  return chain([
    addNgxsPackageToPackageJson(options),
    addDeclarationToNgModule(options),
    options.skipInstall ? noop() : runNpmPackageInstall()
  ]);
}

function addNgxsPackageToPackageJson(options: NgxsPackageSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const ngxsStoreVersion: string = versions['@ngxs/store'];
    if (!ngxsStoreVersion) {
      throw new SchematicsException('Could not resolve the version of "@ngxs/store"');
    }

    Object.values(LIBRARIES)
      .filter(lib => options.packages?.includes(lib))
      .forEach(name => {
        const packageExists = getPackageJsonDependency(host, name);
        if (packageExists === null) {
          addPackageJsonDependency(host, {
            type: NodeDependencyType.Default,
            name,
            version: ngxsStoreVersion
          });
          context.logger.info(`✅️ Added "${name}" into ${NodeDependencyType.Default}`);
        } else {
          context.logger.warn(
            `✅️ "${name}" already exists in the ${NodeDependencyType.Default}`
          );
        }
      });
    return host;
  };
}

function runNpmPackageInstall(): Rule {
  return (_: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    context.logger.info(`🔍 Installing packages...`);
  };
}

function addDeclarationToNgModule(options: NgxsPackageSchema): Rule {
  return (host: Tree) => {
    const project = getProject(host, { project: options.project });

    if (typeof project === 'undefined' || project === null) {
      const message = options.project
        ? `Project "${options.project}" does not exist.`
        : 'Could not determine the project to update.';
      throw new SchematicsException(message);
    }

    const modulePath = getAppModulePath(host, `${project.root}/src/main.ts`);

    if (typeof modulePath === 'undefined') {
      throw new SchematicsException(
        `Module path for project "${options.project}" does not exist.`
      );
    }

    const importPath = '@ngxs/store';

    const moduleImport =
      'NgxsModule.forRoot([], { developmentMode: /** !environment.production */ false, selectorOptions: { suppressErrors: false, injectContainerState: false } })';

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
