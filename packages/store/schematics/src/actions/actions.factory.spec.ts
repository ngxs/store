import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';

import * as path from 'path';

import { ActionsSchema } from './actions.schema';

describe('NGXS Actions', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(workspaceRoot, 'packages/store/schematics/collection.json')
  );
  it('should create action in a folder by default', async () => {
    const options: ActionsSchema = {
      name: 'todos'
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('actions', options).toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/todos/todos.actions.ts']);
  });
  it('should create action without folder if "flat" is set to "true"', async () => {
    const options: ActionsSchema = {
      name: 'todos',
      flat: true
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('actions', options).toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/todos.actions.ts']);
  });
});
