import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';
import { StarterKitSchema } from './starter-kit.schema';
describe('Generate ngxs starter kit', () => {
  const angularSchematicRunner = new SchematicTestRunner(
    '@schematics/angular',
    path.join(workspaceRoot, 'node_modules/@schematics/angular/collection.json')
  );

  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(workspaceRoot, 'packages/store/schematics/collection.json')
  );
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

  it('should generate store in default root folder', async () => {
    const options: StarterKitSchema = {
      spec: true,
      path: './src'
    };
    const tree: UnitTestTree = await runner.runSchematic('starter-kit', options, appTree);

    const files: string[] = tree.files;
    expect(files).toEqual(
      expect.arrayContaining([
        '/src/store/store.config.ts',
        '/src/store/store.module.ts',
        '/src/store/auth/auth.actions.ts',
        '/src/store/auth/auth.state.spec.ts',
        '/src/store/auth/auth.state.ts',
        '/src/store/dashboard/index.ts',
        '/src/store/dashboard/states/dictionary/dictionary.actions.ts',
        '/src/store/dashboard/states/dictionary/dictionary.state.spec.ts',
        '/src/store/dashboard/states/dictionary/dictionary.state.ts',
        '/src/store/dashboard/states/user/user.actions.ts',
        '/src/store/dashboard/states/user/user.state.spec.ts',
        '/src/store/dashboard/states/user/user.state.ts'
      ])
    );
  });

  it('should generate store in default root folder with spec false', async () => {
    const options: StarterKitSchema = {
      spec: false,
      path: './src'
    };

    const tree: UnitTestTree = await runner.runSchematic('starter-kit', options, appTree);

    const files: string[] = tree.files;
    expect(files).toEqual(
      expect.arrayContaining([
        '/src/store/store.config.ts',
        '/src/store/store.module.ts',
        '/src/store/auth/auth.actions.ts',
        '/src/store/auth/auth.state.ts',
        '/src/store/dashboard/index.ts',
        '/src/store/dashboard/states/dictionary/dictionary.actions.ts',
        '/src/store/dashboard/states/dictionary/dictionary.state.ts',
        '/src/store/dashboard/states/user/user.actions.ts',
        '/src/store/dashboard/states/user/user.state.ts'
      ])
    );
  });
});
