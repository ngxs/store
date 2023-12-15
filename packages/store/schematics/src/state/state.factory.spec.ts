import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';

import { createWorkspace } from '@ngxs/store/internals/testing';
import * as path from 'path';
import { StateSchema } from './state.schema';

describe('Generate ngxs state', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(workspaceRoot, 'packages/store/schematics/collection.json')
  );
  const defaultOptions: StateSchema = {
    name: 'todos'
  };

  const testSetup = async (options?: {
    isStandalone?: boolean;
    stateSchema?: StateSchema;
  }) => {
    const appTree = await createWorkspace(options?.isStandalone);

    const stateSchemaOptions: StateSchema = options?.stateSchema || defaultOptions;
    const tree: UnitTestTree = await runner.runSchematic('state', stateSchemaOptions, appTree);

    return { appTree, tree };
  };

  it('should manage name only', async () => {
    // Arrange
    const { tree } = await testSetup();

    // Act
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(
      expect.arrayContaining(['/todos/todos.state.spec.ts', '/todos/todos.state.ts'])
    );
  });

  it('should not create a separate folder if "flat" is set to "true"', async () => {
    // Arrange
    const { tree } = await testSetup({
      stateSchema: {
        ...defaultOptions,
        flat: true
      }
    });

    // Act
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(expect.arrayContaining(['/todos.state.spec.ts', '/todos.state.ts']));
  });

  it('should manage name with spec true', async () => {
    // Arrange
    const { tree } = await testSetup({
      stateSchema: {
        ...defaultOptions,
        spec: true
      }
    });

    // Act
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(
      expect.arrayContaining(['/todos/todos.state.spec.ts', '/todos/todos.state.ts'])
    );
  });

  it('should manage name with spec false', async () => {
    // Arrange
    const { tree } = await testSetup({
      stateSchema: {
        ...defaultOptions,
        spec: false
      }
    });

    // Act
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(expect.arrayContaining(['/todos/todos.state.ts']));
  });

  it('should provideStore if the application is standalone', async () => {
    // Arrange
    const { tree } = await testSetup({
      isStandalone: true,
      stateSchema: {
        ...defaultOptions,
        spec: true
      }
    });

    // Act
    const content = tree.readContent('/todos/todos.state.spec.ts');

    // Assert
    expect(content).toMatch(/provideStore\(\[TodosState\]\)/);
  });

  it('should import the module if the application is non standalone', async () => {
    // Arrange
    const { tree } = await testSetup({
      isStandalone: false,
      stateSchema: {
        ...defaultOptions,
        spec: true
      }
    });

    // Act
    const content = tree.readContent('/todos/todos.state.spec.ts');

    // Assert
    expect(content).toMatch(/NgxsModule.forRoot\(\[TodosState\]\)/);
  });
});
