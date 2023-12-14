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

  let appTree: UnitTestTree;
  const testSetup = async (options?: { isStandalone?: boolean }) => {
    appTree = await createWorkspace(options?.isStandalone);
  };

  it('should manage name only', async () => {
    // Arrange
    await testSetup();
    const options: StateSchema = {
      ...defaultOptions
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('state', options, appTree);
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(
      expect.arrayContaining(['/todos/todos.state.spec.ts', '/todos/todos.state.ts'])
    );
  });

  it('should not create a separate folder if "flat" is set to "true"', async () => {
    // Arrange
    await testSetup();
    const options: StateSchema = {
      ...defaultOptions,
      flat: true
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('state', options, appTree);
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(expect.arrayContaining(['/todos.state.spec.ts', '/todos.state.ts']));
  });

  it('should manage name with spec true', async () => {
    // Arrange
    await testSetup();
    const options: StateSchema = {
      ...defaultOptions,
      spec: true
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('state', options, appTree);
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(
      expect.arrayContaining(['/todos/todos.state.spec.ts', '/todos/todos.state.ts'])
    );
  });

  it('should manage name with spec false', async () => {
    // Arrange
    await testSetup();
    const options: StateSchema = {
      ...defaultOptions,
      spec: false
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('state', options, appTree);
    const files: string[] = tree.files;

    // Assert
    expect(files).toEqual(expect.arrayContaining(['/todos/todos.state.ts']));
  });

  it('should provideStore if the application is standalone', async () => {
    // Arrange
    await testSetup({
      isStandalone: true
    });
    const options: StateSchema = {
      ...defaultOptions,
      spec: true
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('state', options, appTree);
    const content = tree.readContent('/todos/todos.state.spec.ts');

    // Assert
    expect(content).toMatch(/provideStore\(\[TodosState\]\)/);
  });

  it('should import the module if the application is non standalone', async () => {
    // Arrange
    await testSetup({
      isStandalone: false
    });

    const options: StateSchema = {
      ...defaultOptions,
      spec: true
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('state', options, appTree);
    const content = tree.readContent('/todos/todos.state.spec.ts');

    // Assert
    expect(content).toMatch(/NgxsModule.forRoot\(\[TodosState\]\)/);
  });
});
