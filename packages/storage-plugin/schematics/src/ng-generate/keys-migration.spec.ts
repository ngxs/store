import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';
import { join } from 'path';
import { createWorkspace } from '../_testing';

describe('Storage Plugin Migration', () => {
  const ngxsSchematicRunner = new SchematicTestRunner(
    '@ngxs/storage-plugin/schematics',
    join(workspaceRoot, 'packages/storage-plugin/schematics/collection.json')
  );

  const testSetup = async () => {
    const appTree = await createWorkspace();
    appTree.overwrite('package.json', `{"dependencies": {"@ngxs/store": "3.8.2"}}`);

    return { appTree };
  };

  it('migrate empty forRoot', async () => {
    const { appTree } = await testSetup();

    const newContent = `
    import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
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
          NgxsStoragePluginModule.forRoot()
        ],
        bootstrap: [AppComponent]
      })
      export class AppModule { }
    `;

    appTree.overwrite('/projects/foo/src/app/app.module.ts', newContent);

    const tree = await ngxsSchematicRunner.runSchematic('ngxs-keys-migration', {}, appTree);

    const contentUpdate = tree!.readContent('/projects/foo/src/app/app.module.ts');
    expect(contentUpdate).toContain(`keys: '*'`);
  });

  it('migrate forRoot that is missing the "key" property', async () => {
    const { appTree } = await testSetup();

    const newContent = `
    import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
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
          NgxsStoragePluginModule.forRoot({proa: 'valuea', prob: 'valueb'})
        ],
        bootstrap: [AppComponent]
      })
      export class AppModule { }
    `;

    appTree.overwrite('/projects/foo/src/app/app.module.ts', newContent);

    const tree = await ngxsSchematicRunner.runSchematic('ngxs-keys-migration', {}, appTree);

    const contentUpdate = tree!.readContent('/projects/foo/src/app/app.module.ts');

    expect(contentUpdate).toContain(`proa: 'valuea'`);
    expect(contentUpdate).toContain(`prob: 'valueb'`);
    expect(contentUpdate).toContain(`keys: '*'`);
  });

  it('migrate forRoot that has the "key" property', async () => {
    const { appTree } = await testSetup();

    const newContent = `
    import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
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
          NgxsStoragePluginModule.forRoot({proa: 'valuea', prob: 'valueb', key: 'keep this value'})
        ],
        bootstrap: [AppComponent]
      })
      export class AppModule { }
    `;

    appTree.overwrite('/projects/foo/src/app/app.module.ts', newContent);

    const tree = await ngxsSchematicRunner.runSchematic('ngxs-keys-migration', {}, appTree);

    const contentUpdate = tree!.readContent('/projects/foo/src/app/app.module.ts');
    expect(contentUpdate).toContain(`proa: 'valuea'`);
    expect(contentUpdate).toContain(`prob: 'valueb'`);
    expect(contentUpdate).toContain(`keys: 'keep this value'`);
  });
});
