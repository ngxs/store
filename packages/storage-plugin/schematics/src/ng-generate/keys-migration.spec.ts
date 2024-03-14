import { addProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { migrateKeys } from './index';

describe('Storage Plugin Migration', () => {
  const testSetup = async () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', `{"dependencies": {"@ngxs/store": "3.8.2"}}`);

    addProjectConfiguration(tree, 'lib-one', {
      name: 'test-app',
      root: 'projects/foo',
      sourceRoot: 'projects/foo/src',
      projectType: 'application'
    });

    return { tree };
  };

  it('migrate empty forRoot', async () => {
    const { tree } = await testSetup();

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

    tree.write('/projects/foo/src/app/app.module.ts', newContent);

    await migrateKeys(tree);

    const contentUpdate = tree!.read('/projects/foo/src/app/app.module.ts', 'utf8');
    expect(contentUpdate).toContain(`keys: '*'`);
  });

  it('migrate forRoot that is missing the "key" property', async () => {
    const { tree } = await testSetup();

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

    tree.write('/projects/foo/src/app/app.module.ts', newContent);

    await migrateKeys(tree);

    const contentUpdate = tree!.read('/projects/foo/src/app/app.module.ts', 'utf8');
    expect(contentUpdate).toContain(`proa: 'valuea'`);
    expect(contentUpdate).toContain(`prob: 'valueb'`);
    expect(contentUpdate).toContain(`keys: '*'`);
  });

  it('migrate forRoot that has the "key" property', async () => {
    const { tree } = await testSetup();

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

    tree.write('/projects/foo/src/app/app.module.ts', newContent);

    await migrateKeys(tree);

    const contentUpdate = tree!.read('/projects/foo/src/app/app.module.ts', 'utf8');
    expect(contentUpdate).toContain(`proa: 'valuea'`);
    expect(contentUpdate).toContain(`prob: 'valueb'`);
    expect(contentUpdate).toContain(`keys: 'keep this value'`);
  });
});
