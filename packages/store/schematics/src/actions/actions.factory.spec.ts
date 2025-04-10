import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { workspaceRoot } from '@nrwl/devkit';

import * as path from 'path';

import { ActionsSchema } from './actions.schema';
import { createWorkspace } from '../../../schematics-utils/_testing';

describe('NGXS Actions', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(workspaceRoot, 'packages/store/schematics/collection.json')
  );
  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await createWorkspace();
  });

  it('should create action in a folder by default', async () => {
    const options: ActionsSchema = {
      name: 'todos'
    };
    const tree: UnitTestTree = await runner.runSchematic('actions', options, appTree);
    const files: string[] = tree.files;
    expect(files).toEqual(
      expect.arrayContaining(['/projects/foo/src/app/todos/todos.actions.ts'])
    );
  });

  it('should create action without folder if "flat" is set to "true"', async () => {
    const options: ActionsSchema = {
      name: 'todos',
      flat: true
    };
    const tree: UnitTestTree = await runner.runSchematic('actions', options, appTree);
    const files: string[] = tree.files;
    expect(files).toEqual(expect.arrayContaining(['/projects/foo/src/app/todos.actions.ts']));
  });
});
