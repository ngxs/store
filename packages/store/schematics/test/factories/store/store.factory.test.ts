import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

import * as path from 'path';

import { FACTORIES } from '../../../utils';
import { propertyNotEmpty } from '../common/properties';

import { StoreSchema } from '../../../factories/store/store.schema';

describe('NGXS Store', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json')
  );
  it('should manage name only', async () => {
    const options: StoreSchema = {
      name: 'todos'
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync(FACTORIES.STORE, options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/src/todos/todos.actions.ts',
      '/src/todos/todos.state.spec.ts',
      '/src/todos/todos.state.ts'
    ]);
  });

  it('should manage name with spec false', async () => {
    const options: StoreSchema = {
      name: 'auth',
      spec: false
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync(FACTORIES.STORE, options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/src/auth/auth.actions.ts', '/src/auth/auth.state.ts']);
  });

  it('should manage name with spec true', async () => {
    const options: StoreSchema = {
      name: 'users',
      spec: true
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync(FACTORIES.STORE, options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/src/users/users.actions.ts',
      '/src/users/users.state.spec.ts',
      '/src/users/users.state.ts'
    ]);
  });

  it('should error when name is empty', async () => {
    await propertyNotEmpty(runner, FACTORIES.STORE, 'name');
  });
});
