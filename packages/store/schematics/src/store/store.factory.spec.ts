import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';

import * as path from 'path';
import { StoreSchema } from './store.schema';

describe('NGXS Store', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(workspaceRoot, 'packages/store/schematics/collection.json')
  );
  it('should manage name only', async () => {
    const options: StoreSchema = {
      name: 'todos'
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('store', options).toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/todos/todos.actions.ts',
      '/todos/todos.state.spec.ts',
      '/todos/todos.state.ts'
    ]);
  });
  it('should not create a separate folder if "flat" is set to "true"', async () => {
    const options: StoreSchema = {
      name: 'todos',
      flat: true
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('store', options).toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/todos.actions.ts', '/todos.state.spec.ts', '/todos.state.ts']);
  });

  it('should manage name with spec false', async () => {
    const options: StoreSchema = {
      name: 'auth',
      spec: false
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('store', options).toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/auth/auth.actions.ts', '/auth/auth.state.ts']);
  });

  it('should manage name with spec true', async () => {
    const options: StoreSchema = {
      name: 'users',
      spec: true
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('store', options).toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/users/users.actions.ts',
      '/users/users.state.spec.ts',
      '/users/users.state.ts'
    ]);
  });
});
