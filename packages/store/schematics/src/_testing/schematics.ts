import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nx/devkit';
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

  standalone && updateToStandalone(appTree, workspaceOptions, appOptions);

  return appTree;
}

// Note: This is a workaround to convert the application as standalone. Should be removed when migrating to NG17
function updateToStandalone(
  appTree: UnitTestTree,
  workspaceOptions: WorkspaceOptions,
  appOptions: ApplicationOptions
) {
  const mainTsContent = `
      import {
        bootstrapApplication,
      } from '@angular/platform-browser';
      import { AppComponent } from './app/app.component';

      bootstrapApplication(AppComponent).catch((err) =>
        console.error(err),
      );
  `;

  const appComponentContent = `
      import { Component } from '@angular/core';

      @Component({
        selector: 'app-root',
        standalone: true,
        templateUrl: './app.html',
        styleUrls: ['./app.scss'],
      })
      export class AppComponent {}
  `;

  const projectPath = `/${workspaceOptions.newProjectRoot}/${appOptions.name}`;
  appTree.overwrite(`${projectPath}/src/main.ts`, mainTsContent);
  appTree.overwrite(`${projectPath}/src/app/app.ts`, appComponentContent);
  if (appTree.files.includes(`${projectPath}/src/app/app-module.ts`)) {
    appTree.delete(`${projectPath}/src/app/app-module.ts`);
  }
}
