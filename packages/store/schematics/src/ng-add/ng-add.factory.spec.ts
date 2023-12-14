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

  const defaultOptions: NgxsPackageSchema = {
    skipInstall: false,
    plugins: []
  };

  let appTree: UnitTestTree;
  const testSetup = async (options?: { isStandalone?: boolean }) => {
    appTree = await createWorkspace(options?.isStandalone);
  };

  describe('importing the Ngxs module in a non standalone app', () => {
    test.each`
      project
      ${undefined}
      ${'foo'}
    `('should import the module when project is $project ', async ({ project }) => {
      // Arrange
      await testSetup({ isStandalone: false });
      const options: NgxsPackageSchema = { ...defaultOptions, project };
      // Act
      const tree = await ngxsSchematicRunner.runSchematic('ngxs-init', options, appTree);

      // Assert
      const content = tree.readContent('/projects/foo/src/app/app.module.ts');
      expect(content).toMatch(/import { NgxsModule } from '@ngxs\/store'/);
      expect(content).toMatch(/imports: \[[^\]]*NgxsModule.forRoot\(\[\],[^\]]*\]/m);
      expect(content).toContain(
        'NgxsModule.forRoot([], { developmentMode: /** !environment.production */ false, selectorOptions: { suppressErrors: false, injectContainerState: false } })'
      );
    });
    it('should throw if invalid project is specified', async () => {
      // Arrange
      await testSetup();
      const options: NgxsPackageSchema = { ...defaultOptions, project: 'hello' };

      // Assert
      await expect(
        ngxsSchematicRunner.runSchematic('ng-add', options, appTree)
      ).rejects.toThrow(`Project "${options.project}" does not exist.`);
    });
  });

  describe('should have the provideStore provider in a standalone app', () => {
    test.each`
      project
      ${undefined}
      ${'foo'}
    `('should import the module when project is $project ', async ({ project }) => {
      // Arrange
      await testSetup({ isStandalone: true });
      const options: NgxsPackageSchema = { ...defaultOptions, project };

      // Act
      const tree = await ngxsSchematicRunner.runSchematic('ngxs-init', options, appTree);

      const content = tree.readContent('/projects/foo/src/main.ts');

      // Assert
      expect(content).toMatch(/provideStore\(/);
      expect(tree.files).not.toContain('/projects/foo/src/app/app.module.ts');
    });
  });

  describe('ng-add package in package.json', () => {
    it('should add ngxs store with provided plugins in package.json', async () => {
      const plugins = [LIBRARIES.DEVTOOLS, LIBRARIES.LOGGER];
      const options: NgxsPackageSchema = { plugins };
      appTree = await ngxsSchematicRunner.runSchematic('ng-add', options, appTree);

      const packageJsonText = appTree.readContent('/package.json');
      const packageJson = JSON.parse(packageJsonText);
      expect(plugins.every(p => !!packageJson.dependencies[p])).toBeTruthy();
    });

    it('should add ngxs store with all plugins in package.json', async () => {
      const packages = Object.values(LIBRARIES).filter(v => v !== LIBRARIES.STORE);
      const options: NgxsPackageSchema = { plugins: packages };
      appTree = await ngxsSchematicRunner.runSchematic('ng-add', options, appTree);

      const packageJsonText = appTree.readContent('/package.json');
      const packageJson = JSON.parse(packageJsonText);
      expect(packages.every(p => !!packageJson.dependencies[p])).toBeTruthy();
    });

    it('should not attempt to add non-existent package', async () => {
      const packages = ['who-am-i'];
      const options: NgxsPackageSchema = { plugins: packages };
      await expect(
        ngxsSchematicRunner.runSchematic('ng-add', options, appTree)
      ).rejects.toThrow();
    });
  });
});
