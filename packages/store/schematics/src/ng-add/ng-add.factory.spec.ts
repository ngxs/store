import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';
import { join } from 'path';

import { createWorkspace } from '@ngxs/store/internals/testing';
import { LIBRARIES } from '../utils/common/lib.config';
import { NgxsPackageSchema } from './ng-add.schema';

describe('Ngxs ng-add Schematic', () => {
  const ngxsSchematicRunner = new SchematicTestRunner(
    '@ngxs/store/schematics',
    join(workspaceRoot, 'packages/store/schematics/collection.json')
  );

  describe('run ngxs-init alias', () => {
    const defaultOptions: NgxsPackageSchema = {
      skipInstall: false,
      plugins: []
    };

    const testSetup = async (options?: {
      isStandalone?: boolean;
      ngxsPackageSchema?: NgxsPackageSchema;
      runSchematic?: boolean;
    }) => {
      const runSchematic = options?.runSchematic || true;
      const appTree = await createWorkspace(options?.isStandalone);
      let tree: UnitTestTree | undefined = undefined;
      if (runSchematic) {
        const schemaOptions: NgxsPackageSchema = options?.ngxsPackageSchema || defaultOptions;
        tree = await ngxsSchematicRunner.runSchematic('ngxs-init', schemaOptions, appTree);
      }

      return { appTree, tree };
    };
    describe('importing the Ngxs module in a non standalone app', () => {
      test.each`
        project
        ${undefined}
        ${'foo'}
      `('should import the module when project is $project ', async ({ project }) => {
        // Arrange & Act
        const { tree } = await testSetup({
          isStandalone: false,
          ngxsPackageSchema: { ...defaultOptions, project }
        });

        // Assert
        const content = tree!.readContent('/projects/foo/src/app/app.module.ts');
        expect(content).toMatch(/import { NgxsModule } from '@ngxs\/store'/);
        expect(content).toMatch(/imports: \[[^\]]*NgxsModule.forRoot\(\[\],[^\]]*\]/m);
        expect(content).toContain(
          'NgxsModule.forRoot([], { developmentMode: /** !environment.production */ false, selectorOptions: { suppressErrors: false, injectContainerState: false } })'
        );
      });
      it('should throw if invalid project is specified', async () => {
        // Arrange
        const { appTree } = await testSetup({
          runSchematic: false
        });

        const schemaOptions: NgxsPackageSchema = { ...defaultOptions, project: 'hello' };

        // Assert
        await expect(
          ngxsSchematicRunner.runSchematic('ng-add', schemaOptions, appTree)
        ).rejects.toThrow(`Project "${schemaOptions.project}" does not exist.`);
      });
    });

    describe('should have the provideStore provider in a standalone app', () => {
      test.each`
        project
        ${undefined}
        ${'foo'}
      `('should import the module when project is $project ', async ({ project }) => {
        // Arrange
        const { tree } = await testSetup({
          isStandalone: true,
          ngxsPackageSchema: { ...defaultOptions, project }
        });

        // Act
        const content = tree!.readContent('/projects/foo/src/main.ts');

        // Assert
        expect(content).toMatch(/provideStore\(/);
        expect(tree!.files).not.toContain('/projects/foo/src/app/app.module.ts');
      });
    });
  });

  describe('ng-add package in package.json', () => {
    const testSetup = async (options?: {
      isStandalone?: boolean;
      ngxsPackageSchema?: NgxsPackageSchema;
      runSchematic?: boolean;
    }) => {
      const runSchematic = options?.runSchematic || true;
      const appTree = await createWorkspace(options?.isStandalone);
      let tree: UnitTestTree | undefined = undefined;

      if (runSchematic) {
        const schemaOptions: NgxsPackageSchema = options?.ngxsPackageSchema || {};
        tree = await ngxsSchematicRunner.runSchematic('ng-add', schemaOptions, appTree);
      }

      return { appTree, tree };
    };

    it('should add ngxs store with provided plugins in package.json', async () => {
      // Arrange
      const plugins = [LIBRARIES.DEVTOOLS, LIBRARIES.LOGGER];
      let { tree } = await testSetup({
        ngxsPackageSchema: { plugins }
      });

      // Act
      const packageJsonText = tree!.readContent('/package.json');
      const packageJson = JSON.parse(packageJsonText);

      // Assert
      expect(plugins?.every(p => !!packageJson.dependencies[p])).toBeTruthy();
    });

    it('should add ngxs store with all plugins in package.json', async () => {
      // Arrange
      const plugins = Object.values(LIBRARIES).filter(v => v !== LIBRARIES.STORE);
      let { tree } = await testSetup({
        ngxsPackageSchema: { plugins }
      });

      // Act
      const packageJsonText = tree!.readContent('/package.json');
      const packageJson = JSON.parse(packageJsonText);

      // Assert
      expect(plugins.every(p => !!packageJson.dependencies[p])).toBeTruthy();
    });

    it('should not attempt to add non-existent package', async () => {
      // Arrange & Act
      const { appTree } = await testSetup({
        runSchematic: false
      });
      const plugins = ['who-am-i'];
      const options: NgxsPackageSchema = { plugins };

      // Assert
      await expect(
        ngxsSchematicRunner.runSchematic('ng-add', options, appTree)
      ).rejects.toThrow();
    });
  });
});
