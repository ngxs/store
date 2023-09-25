import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';

import * as path from 'path';
import { StateSchema } from './state.schema';

describe('Generate ngxs state', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(workspaceRoot, 'packages/store/schematics/collection.json')
  );
  const defaultOptions: StateSchema = {
    name: 'todos'
  };
  it('should manage name only', async () => {
    const options: StateSchema = {
      ...defaultOptions
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('state', options).toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/todos/todos.state.spec.ts', '/todos/todos.state.ts']);
  });

  it('should not create a separate folder if "flat" is set to "true"', async () => {
    const options: StateSchema = {
      ...defaultOptions,
      flat: true
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('state', options).toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/todos.state.spec.ts', '/todos.state.ts']);
  });

  it('should manage name with spec true', async () => {
    const options: StateSchema = {
      ...defaultOptions,
      spec: true
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('state', options).toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/todos/todos.state.spec.ts', '/todos/todos.state.ts']);
  });

  it('should manage name with spec false', async () => {
    const options: StateSchema = {
      ...defaultOptions,
      spec: false
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('state', options).toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/todos/todos.state.ts']);
  });
});
