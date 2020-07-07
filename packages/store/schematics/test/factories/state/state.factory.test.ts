import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

import * as path from 'path';

import { FACTORIES } from '../../../src/utils';
import { propertyNotEmpty } from '../common/properties';

import { StateSchema } from '../../../src/factories/state/state.schema';

describe('Generate ngxs state', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json')
  );
  it('should manage name only', () => {
    const options: StateSchema = {
      name: 'todos'
    };
    const tree: UnitTestTree = runner.runSchematic(FACTORIES.STATE, options);
    const files: string[] = tree.files;
    expect(files).toEqual(['/src/todos/todos.state.spec.ts', '/src/todos/todos.state.ts']);
  });

  it('should manage name with spec true', () => {
    const options: StateSchema = {
      name: 'auth',
      spec: true
    };
    const tree: UnitTestTree = runner.runSchematic(FACTORIES.STATE, options);
    const files: string[] = tree.files;
    expect(files).toEqual(['/src/auth/auth.state.spec.ts', '/src/auth/auth.state.ts']);
  });

  it('should manage name with spec false', () => {
    const options: StateSchema = {
      name: 'users',
      spec: false
    };
    const tree: UnitTestTree = runner.runSchematic(FACTORIES.STATE, options);
    const files: string[] = tree.files;
    expect(files).toEqual(['/src/users/users.state.ts']);
  });

  it('should error when name is empty', () => {
    propertyNotEmpty(runner, FACTORIES.STATE, 'name');
  });
});
