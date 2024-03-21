import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';

const angularSchematicRunner = new SchematicTestRunner(
  '@schematics/angular',
  path.join(workspaceRoot, 'node_modules/@schematics/angular/collection.json')
);

const defaultWorkspaceOptions: WorkspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '1.0.0'
};

const defaultAppOptions: ApplicationOptions = {
  name: 'foo',
  inlineStyle: false,
  inlineTemplate: false,
  routing: true,
  skipTests: false,
  skipPackageJson: false
};

export async function createWorkspace(
  standalone = false,
  schematicRunner = angularSchematicRunner,
  workspaceOptions = defaultWorkspaceOptions,
  appOptions = defaultAppOptions
) {
  let appTree: UnitTestTree = await schematicRunner.runSchematic(
    'workspace',
    workspaceOptions
  );
  appTree = await schematicRunner.runSchematic(
    'application',
    {
      ...appOptions,
      // Specify explicitly because it's truthy by default since Angular 17.
      standalone
    },
    appTree
  );

  return appTree;
}
