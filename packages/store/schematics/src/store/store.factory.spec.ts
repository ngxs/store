import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { createWorkspace } from '@ngxs/store/internals/testing';
import { workspaceRoot } from '@nrwl/devkit';
import * as path from 'path';
import { StoreSchema } from './store.schema';

describe('NGXS Store', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(workspaceRoot, 'packages/store/schematics/collection.json')
  );
  const defaultOptions: StoreSchema = {
    name: 'todos'
  };

  let appTree: UnitTestTree;
  const testSetup = async (options?: { isStandalone?: boolean }) => {
    appTree = await createWorkspace(options?.isStandalone);
  };

  it('should manage name only', async () => {
    // Arrange
    await testSetup();
    const options: StoreSchema = {
      ...defaultOptions
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('store', options, appTree);
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(
      expect.arrayContaining([
        '/todos/todos.actions.ts',
        '/todos/todos.state.spec.ts',
        '/todos/todos.state.ts'
      ])
    );
  });

  it('should not create a separate folder if "flat" is set to "true"', async () => {
    // Arrange
    await testSetup();
    const options: StoreSchema = {
      ...defaultOptions,
      flat: true
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('store', options, appTree);
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(
      expect.arrayContaining(['/todos.actions.ts', '/todos.state.spec.ts', '/todos.state.ts'])
    );
  });

  it('should manage name with spec false', async () => {
    // Arrange
    await testSetup();
    const options: StoreSchema = {
      ...defaultOptions,
      spec: false
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('store', options, appTree);
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(
      expect.arrayContaining(['/todos/todos.actions.ts', '/todos/todos.state.ts'])
    );
  });

  it('should manage name with spec true', async () => {
    // Arrange
    await testSetup();
    const options: StoreSchema = {
      ...defaultOptions,
      spec: true
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('store', options, appTree);
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(
      expect.arrayContaining([
        '/todos/todos.actions.ts',
        '/todos/todos.state.spec.ts',
        '/todos/todos.state.ts'
      ])
    );
  });
});
