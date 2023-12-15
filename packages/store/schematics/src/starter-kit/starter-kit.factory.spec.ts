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

  const defaultOptions: StarterKitSchema = {
    path: './src'
  };

  const testSetup = async (options?: {
    isStandalone?: boolean;
    starterKitSchema?: StarterKitSchema;
  }) => {
    const appTree = await createWorkspace(options?.isStandalone);
    const starterKitSchemaOptions: StarterKitSchema =
      options?.starterKitSchema || defaultOptions;
    const tree: UnitTestTree = await runner.runSchematic(
      'starter-kit',
      starterKitSchemaOptions,
      appTree
    );
    return { appTree, tree };
  };

  it('should generate store in default root folder', async () => {
    // Arrange
    const { tree } = await testSetup({
      starterKitSchema: {
        ...defaultOptions,
        spec: true
      }
    });

    // Act
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
    const { tree } = await testSetup({
      starterKitSchema: {
        ...defaultOptions,
        spec: false
      }
    });

    // Act
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
    const { tree } = await testSetup({
      isStandalone: true,
      starterKitSchema: {
        ...defaultOptions,
        spec: true
      }
    });

    // Act
    const content = tree.readContent(
      '/src/store/dashboard/states/dictionary/dictionary.state.spec.ts'
    );

    // Assert
    expect(content).toMatch(/provideStore\(\[DictionaryState\]\)/);
  });

  it('should import the module if the application is non standalone', async () => {
    // Arrange
    const { tree } = await testSetup({
      isStandalone: false,
      starterKitSchema: {
        ...defaultOptions,
        spec: true
      }
    });

    // Act
    const content = tree.readContent(
      '/src/store/dashboard/states/dictionary/dictionary.state.spec.ts'
    );

    // Assert
    expect(content).toMatch(/NgxsModule.forRoot\(\[DictionaryState\]\)/);
  });
});
