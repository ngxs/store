import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  chain,
  noop
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  NodeDependencyType,
  addPackageJsonDependency,
  getPackageJsonDependency
} from '@schematics/angular/utility/dependencies';

import { LIBRARIES } from '../utils/common/lib.config';

import { NgxsPackageSchema } from './ng-add.schema';
import { getProjectMainFile } from '../utils/ng-utils/project';
import { isStandaloneApp } from '../utils/ng-utils/ng-ast-utils';
import {
  addDeclarationToNonStandaloneApp,
  addDeclarationToStandaloneApp
} from './add-declaration';
import { getProject } from '../utils/project';

const versions = require('./../utils/versions.json');

export type NormalizedNgxsPackageSchema = {
  skipInstall: boolean;
  plugins: LIBRARIES[];
  project: string;
};

export function ngAdd(options: NgxsPackageSchema): Rule {
  return (host: Tree) => {
    const normalizedSchema = normalizeSchema(host, options);

    return chain([
      addNgxsPackageToPackageJson(normalizedSchema),
      addDeclaration(normalizedSchema),
      normalizedSchema.skipInstall ? noop() : runNpmPackageInstall()
    ]);
  };
}

function addNgxsPackageToPackageJson(schema: NormalizedNgxsPackageSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const ngxsStoreVersion: string = versions['@ngxs/store'];
    if (!ngxsStoreVersion) {
      throw new SchematicsException('Could not resolve the version of "@ngxs/store"');
    }

    schema.plugins!.forEach(name => {
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

function addDeclaration(schema: NormalizedNgxsPackageSchema): Rule {
  return async (host: Tree) => {
    const mainFile = getProjectMainFile(host, schema.project);
    const isStandalone = isStandaloneApp(host, mainFile);

    if (isStandalone) {
      return addDeclarationToStandaloneApp(schema);
    } else {
      return addDeclarationToNonStandaloneApp(schema);
    }
  };
}

function normalizeSchema(host: Tree, schema: NgxsPackageSchema): NormalizedNgxsPackageSchema {
  const projectName = getProject(host, schema.project)?.name;
  if (!projectName) {
    throw new SchematicsException(`Project "${schema.project}" does not exist.`);
  }
  return {
    skipInstall: !!schema.skipInstall,
    plugins: Object.values(LIBRARIES).filter(lib => schema.plugins?.includes(lib)) ?? [],
    project: projectName
  };
}
