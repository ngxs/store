import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { NgxsPackageSchema } from './ng-add.schema';

describe('Ngxs ng-add Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    '@schematics/angular',
    require.resolve('../../../../../node_modules/@schematics/angular/collection.json')
  );

  const ngxsSchematicRunner = new SchematicTestRunner(
    '@ngxs/store/schematics',
    require.resolve('../../collection.json')
  );

  const defaultOptions: NgxsPackageSchema = {
    skipInstall: false,
    packages: [],
    name: ''
  };

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
    appTree = await schematicRunner
      .runSchematicAsync('workspace', workspaceOptions)
      .toPromise();
    appTree = await schematicRunner
      .runSchematicAsync('application', appOptions, appTree)
      .toPromise();
  });

  it('should not import Ngxs module into the application module if a project name is not provided', async () => {
    // Arrange
    const options: NgxsPackageSchema = { ...defaultOptions };
    // Act
    const tree = await ngxsSchematicRunner
      .runSchematicAsync('ngxs-init', options, appTree)
      .toPromise();
    // Assert
    const content = tree.readContent('/projects/foo/src/app/app.module.ts');
    expect(content).not.toMatch(/import { NgxsModule } from '@ngxs\/store'/);
    expect(content).not.toMatch(/imports: \[[^\]]*NgxsModule[^\]]*\]/m);
  });

  it('should import Ngxs module into the application module if a project name is provided', async () => {
    const options: NgxsPackageSchema = { ...defaultOptions, name: 'foo' };

    const tree = await ngxsSchematicRunner
      .runSchematicAsync('ngxs-init', options, appTree)
      .toPromise();
    const content = tree.readContent('/projects/foo/src/app/app.module.ts');
    expect(content).toMatch(/import { NgxsModule } from '@ngxs\/store'/);
    expect(content).toMatch(/imports: \[[^\]]*NgxsModule.forRoot\(\[\],[^\]]*\]/m);
    expect(content).toMatch(
      /imports: \[[^\]]*NgxsModule.forRoot\(\[\], \{developmentMode\: \!environment\.production,selectorOptions\: \{suppressErrors\: false,injectContainerState\: false\}\}\)[^\]]*\]/m
    );
  });
});
