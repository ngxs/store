import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { createWorkspace } from '@ngxs/store/internals/testing';
import { workspaceRoot } from '@nrwl/devkit';
import * as path from 'path';
import { StarterKitSchema } from './starter-kit.schema';

describe('Generate ngxs starter kit', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(workspaceRoot, 'packages/store/schematics/collection.json')
  );

  let appTree: UnitTestTree;
  const testSetup = async (options?: { isStandalone?: boolean }) => {
    appTree = await createWorkspace(options?.isStandalone);
  };

  it('should generate store in default root folder', async () => {
    // Arrange
    await testSetup();
    const options: StarterKitSchema = {
      spec: true,
      path: './src'
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('starter-kit', options, appTree);
    const files: string[] = tree.files;

    // Assert
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
    // Arrange
    await testSetup();
    const options: StarterKitSchema = {
      spec: false,
      path: './src'
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('starter-kit', options, appTree);
    const files: string[] = tree.files;

    // Assert
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

  it('should provideStore if the application is standalone', async () => {
    // Arrange
    await testSetup({
      isStandalone: true
    });
    const options: StarterKitSchema = {
      spec: true,
      path: './src'
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('starter-kit', options, appTree);
    const content = tree.readContent(
      '/src/store/dashboard/states/dictionary/dictionary.state.spec.ts'
    );

    // Assert
    expect(content).toMatch(/provideStore\(\[DictionaryState\]\)/);
  });

  it('should import the module if the application is non standalone', async () => {
    // Arrange
    await testSetup({
      isStandalone: false
    });
    const options: StarterKitSchema = {
      spec: true,
      path: './src'
    };

    // Act
    const tree: UnitTestTree = await runner.runSchematic('starter-kit', options, appTree);
    const content = tree.readContent(
      '/src/store/dashboard/states/dictionary/dictionary.state.spec.ts'
    );

    // Assert
    expect(content).toMatch(/NgxsModule.forRoot\(\[DictionaryState\]\)/);
  });
});
