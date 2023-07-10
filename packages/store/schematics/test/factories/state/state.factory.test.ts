import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

import * as path from 'path';

import { FACTORIES } from '../../../utils';
import { propertyNotEmpty } from '../common/properties';

import { StateSchema } from '../../../factories/state/state.schema';

describe('Generate ngxs state', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json')
  );
  it('should manage name only', async () => {
    const options: StateSchema = {
      name: 'todos'
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync(FACTORIES.STATE, options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/src/todos/todos.state.spec.ts', '/src/todos/todos.state.ts']);
  });

  it('should manage name with spec true', async () => {
    const options: StateSchema = {
      name: 'auth',
      spec: true
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync(FACTORIES.STATE, options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/src/auth/auth.state.spec.ts', '/src/auth/auth.state.ts']);
  });

  it('should manage name with spec false', async () => {
    const options: StateSchema = {
      name: 'users',
      spec: false
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync(FACTORIES.STATE, options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/src/users/users.state.ts']);
  });

  it('should error when name is empty', async () => {
    await propertyNotEmpty(runner, FACTORIES.STATE, 'name');
  });
});
