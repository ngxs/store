import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';
import { StoreSchema } from './store.schema';

describe('NGXS Store', () => {
  const angularSchematicRunner = new SchematicTestRunner(
    '@schematics/angular',
    path.join(workspaceRoot, 'node_modules/@schematics/angular/collection.json')
  );

  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(workspaceRoot, 'packages/store/schematics/collection.json')
  );
  const defaultOptions: StoreSchema = {
    name: 'todos'
  };

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '1.0.0'
  };

  const appOptions: ApplicationOptions = {
    name: 'foo',
    inlineStyle: false,
    inlineTemplate: false,
    routing: true,
    skipTests: false,
    skipPackageJson: false
  };

  let appTree: UnitTestTree;
  beforeEach(async () => {
    appTree = await angularSchematicRunner.runSchematic('workspace', workspaceOptions);
    appTree = await angularSchematicRunner.runSchematic('application', appOptions, appTree);
  });

  it('should manage name only', async () => {
    const options: StoreSchema = {
      ...defaultOptions
    };
    const tree: UnitTestTree = await runner.runSchematic('store', options, appTree);
    const files: string[] = tree.files;
    expect(files).toEqual(
      expect.arrayContaining([
        '/todos/todos.actions.ts',
        '/todos/todos.state.spec.ts',
        '/todos/todos.state.ts'
      ])
    );
  });

  it('should not create a separate folder if "flat" is set to "true"', async () => {
    const options: StoreSchema = {
      ...defaultOptions,
      flat: true
    };
    const tree: UnitTestTree = await runner.runSchematic('store', options, appTree);
    const files: string[] = tree.files;
    expect(files).toEqual(
      expect.arrayContaining(['/todos.actions.ts', '/todos.state.spec.ts', '/todos.state.ts'])
    );
  });

  it('should manage name with spec false', async () => {
    const options: StoreSchema = {
      ...defaultOptions,
      spec: false
    };
    const tree: UnitTestTree = await runner.runSchematic('store', options, appTree);
    const files: string[] = tree.files;
    expect(files).toEqual(
      expect.arrayContaining(['/todos/todos.actions.ts', '/todos/todos.state.ts'])
    );
  });

  it('should manage name with spec true', async () => {
    const options: StoreSchema = {
      ...defaultOptions,
      spec: true
    };
    const tree: UnitTestTree = await runner.runSchematic('store', options, appTree);
    const files: string[] = tree.files;
    expect(files).toEqual(
      expect.arrayContaining([
        '/todos/todos.actions.ts',
        '/todos/todos.state.spec.ts',
        '/todos/todos.state.ts'
      ])
    );
  });
});
