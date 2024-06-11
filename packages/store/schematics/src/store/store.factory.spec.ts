import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';
import * as path from 'path';
import { createWorkspace } from '../_testing';
import { StoreSchema } from './store.schema';

describe('NGXS Store', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(workspaceRoot, 'packages/store/schematics/collection.json')
  );
  const defaultOptions: StoreSchema = {
    name: 'todos'
  };

  const testSetup = async (options?: {
    isStandalone?: boolean;
    storeSchema?: StoreSchema;
    createSecondProject?: boolean;
  }) => {
    let appTree = await createWorkspace(options?.isStandalone);
    const angularSchematicRunner = new SchematicTestRunner(
      '@schematics/angular',
      path.join(workspaceRoot, 'node_modules/@schematics/angular/collection.json')
    );
    if (options?.createSecondProject) {
      appTree = await angularSchematicRunner.runSchematic(
        'application',
        {
          name: 'second-app'
        },
        appTree
      );
    }

    const storeSchemaOptions: StoreSchema = options?.storeSchema || defaultOptions;
    const tree: UnitTestTree = await runner.runSchematic('store', storeSchemaOptions, appTree);

    return { appTree, tree };
  };

  it('should manage name only', async () => {
    // Arrange
    const { tree } = await testSetup();

    // Act
    const files: string[] = tree.files;
    // Assert
    expect(files).toEqual(
      expect.arrayContaining([
        '/projects/foo/src/app/todos/todos.actions.ts',
        '/projects/foo/src/app/todos/todos.state.spec.ts',
        '/projects/foo/src/app/todos/todos.state.ts'
      ])
    );
  });

  it('should not create a separate folder if "flat" is set to "true"', async () => {
    // Arrange
    const { tree } = await testSetup({
      storeSchema: {
        ...defaultOptions,
        flat: true
      }
    });

    // Act
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(
      expect.arrayContaining([
        '/projects/foo/src/app/todos.actions.ts',
        '/projects/foo/src/app/todos.state.spec.ts',
        '/projects/foo/src/app/todos.state.ts'
      ])
    );
  });

  it('should manage name with spec false', async () => {
    // Arrange
    const { tree } = await testSetup({
      storeSchema: {
        ...defaultOptions,
        spec: false
      }
    });

    // Act
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(
      expect.arrayContaining([
        '/projects/foo/src/app/todos/todos.actions.ts',
        '/projects/foo/src/app/todos/todos.state.ts'
      ])
    );
  });

  it('should manage name with spec true', async () => {
    // Arrange
    const { tree } = await testSetup({
      storeSchema: {
        ...defaultOptions,
        spec: true
      }
    });

    // Act
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(
      expect.arrayContaining([
        '/projects/foo/src/app/todos/todos.actions.ts',
        '/projects/foo/src/app/todos/todos.state.spec.ts',
        '/projects/foo/src/app/todos/todos.state.ts'
      ])
    );
  });

  it('should resolve the path relative to the default project', async () => {
    // Arrange
    const { tree } = await testSetup({
      storeSchema: {
        ...defaultOptions,
        path: 'my-nested-path'
      }
    });

    // Act
    const files: string[] = tree.files;
    // Assert
    expect(files).toEqual(
      expect.arrayContaining([
        '/projects/foo/src/app/my-nested-path/todos/todos.actions.ts',
        '/projects/foo/src/app/my-nested-path/todos/todos.state.spec.ts',
        '/projects/foo/src/app/my-nested-path/todos/todos.state.ts'
      ])
    );
  });

  it("should throw if there're multiple projects and none is specified explicitly", async () => {
    // Arrange
    await expect(testSetup({ createSecondProject: true })).rejects.toThrow(
      'Could not determine the project name. Make sure to provide the "project" option manually'
    );
  });
});
