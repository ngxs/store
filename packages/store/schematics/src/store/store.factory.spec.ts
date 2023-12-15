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

  const testSetup = async (options?: {
    isStandalone?: boolean;
    storeSchema?: StoreSchema;
  }) => {
    const appTree = await createWorkspace(options?.isStandalone);

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
        '/todos/todos.actions.ts',
        '/todos/todos.state.spec.ts',
        '/todos/todos.state.ts'
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
      expect.arrayContaining(['/todos.actions.ts', '/todos.state.spec.ts', '/todos.state.ts'])
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
      expect.arrayContaining(['/todos/todos.actions.ts', '/todos/todos.state.ts'])
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
        '/todos/todos.actions.ts',
        '/todos/todos.state.spec.ts',
        '/todos/todos.state.ts'
      ])
    );
  });
});
