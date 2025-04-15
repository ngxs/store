import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';
import { join } from 'path';
import { createWorkspace } from '../../../schematics-utils/_testing';

const versions = require('../../../schematics-utils/src/versions.json');
const ngxsStoreVersion: string = versions['@ngxs/store'];

describe('Migrate to 19.1.0', () => {
  const ngxsMigrationsRunner = new SchematicTestRunner(
    '@ngxs/store/migrations',
    join(workspaceRoot, 'packages/store/migrations/migrations.json')
  );

  const testSetup = async (options?: { isStandalone?: boolean }) => {
    const appTree = await createWorkspace(options?.isStandalone);
    appTree.overwrite(
      'package.json',
      `{"dependencies": {"@ngxs/store": "${ngxsStoreVersion}"}}`
    );

    return { appTree };
  };

  it('migrate empty forRoot', async () => {
    const { appTree } = await testSetup();

    const newContent = `
    import { NgxsModule } from '@ngxs/store';
    import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';

    import { AppRoutingModule } from './app-routing.module';
    import { AppComponent } from './app.component';

      @NgModule({
        declarations: [
          AppComponent
        ],
        imports: [
          BrowserModule,
          AppRoutingModule,
          NgxsModule.forRoot()
        ],
        bootstrap: [AppComponent]
      })
      export class AppModule { }
    `;

    appTree.overwrite('/projects/foo/src/app/app.module.ts', newContent);

    const tree = await ngxsMigrationsRunner.runSchematic(
      'ngxs-store-migration-19-1-0',
      {},
      appTree
    );

    const contentUpdate = tree!.readContent('/projects/foo/src/app/app.module.ts');
    expect(contentUpdate).toMatchSnapshot();
  });

  it('migrate forRoot with states', async () => {
    const { appTree } = await testSetup();

    const newContent = `
    import { NgxsModule } from '@ngxs/store';
    import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';

    import { AppRoutingModule } from './app-routing.module';
    import { AppComponent } from './app.component';

      @NgModule({
        declarations: [
          AppComponent
        ],
        imports: [
          BrowserModule,
          AppRoutingModule,
          NgxsModule.forRoot(states)
        ],
        bootstrap: [AppComponent]
      })
      export class AppModule { }
    `;

    appTree.overwrite('/projects/foo/src/app/app.module.ts', newContent);

    const tree = await ngxsMigrationsRunner.runSchematic(
      'ngxs-store-migration-19-1-0',
      {},
      appTree
    );

    const contentUpdate = tree!.readContent('/projects/foo/src/app/app.module.ts');
    expect(contentUpdate).toMatchSnapshot();
  });

  it('migrate forRoot with states and existing options', async () => {
    const { appTree } = await testSetup();

    const newContent = `
    import { NgxsModule } from '@ngxs/store';
    import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';

    import { AppRoutingModule } from './app-routing.module';
    import { AppComponent } from './app.component';

      @NgModule({
        declarations: [
          AppComponent
        ],
        imports: [
          BrowserModule,
          AppRoutingModule,
          NgxsModule.forRoot(states, {foo:'bar'})
        ],
        bootstrap: [AppComponent]
      })
      export class AppModule { }
    `;

    appTree.overwrite('/projects/foo/src/app/app.module.ts', newContent);

    const tree = await ngxsMigrationsRunner.runSchematic(
      'ngxs-store-migration-19-1-0',
      {},
      appTree
    );

    const contentUpdate = tree!.readContent('/projects/foo/src/app/app.module.ts');
    expect(contentUpdate).toMatchSnapshot();
  });

  it('migrate from a constant array', async () => {
    const { appTree } = await testSetup();

    const newContent = `
    import { NgxsModule } from '@ngxs/store';
    import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';

    import { AppRoutingModule } from './app-routing.module';
    import { AppComponent } from './app.component';

    const imports = [
      BrowserModule,
      AppRoutingModule,
      NgxsModule.forRoot(states, {foo:'bar'})
    ];

      @NgModule({
        declarations: [
          AppComponent
        ],
        imports,
        bootstrap: [AppComponent]
      })
      export class AppModule { }
    `;

    appTree.overwrite('/projects/foo/src/app/app.module.ts', newContent);

    const tree = await ngxsMigrationsRunner.runSchematic(
      'ngxs-store-migration-19-1-0',
      {},
      appTree
    );

    const contentUpdate = tree!.readContent('/projects/foo/src/app/app.module.ts');
    expect(contentUpdate).toMatchSnapshot();
  });

  it('migrate provideStore with states without options', async () => {
    const { appTree } = await testSetup({
      isStandalone: true
    });

    const newContent = `
    import { bootstrapApplication } from '@angular/platform-browser';
    import { AppComponent } from './app/app.component';
    import { provideStore } from '@ngxs/store';

    bootstrapApplication(AppComponent, {
      providers: [provideStore([])],
    });

    `;

    appTree.overwrite('/projects/foo/src/main.ts', newContent);

    const tree = await ngxsMigrationsRunner.runSchematic(
      'ngxs-store-migration-19-1-0',
      {},
      appTree
    );

    const contentUpdate = tree!.readContent('/projects/foo/src/main.ts');
    expect(contentUpdate).toMatchSnapshot();
  });

  it('migrate provideStore with states and existing options', async () => {
    const { appTree } = await testSetup({
      isStandalone: true
    });

    const newContent = `
    import { bootstrapApplication } from '@angular/platform-browser';
    import { AppComponent } from './app/app.component';
    import { provideStore } from '@ngxs/store';

    bootstrapApplication(AppComponent, {
      providers: [provideStore([], {foo:'bar'})],
    });

    `;

    appTree.overwrite('/projects/foo/src/main.ts', newContent);

    const tree = await ngxsMigrationsRunner.runSchematic(
      'ngxs-store-migration-19-1-0',
      {},
      appTree
    );

    const contentUpdate = tree!.readContent('/projects/foo/src/main.ts');

    expect(contentUpdate).toMatchSnapshot();
  });
});
