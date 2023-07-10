import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

import * as path from 'path';

import { FACTORIES } from '../../../utils';
import { propertyNotEmpty } from '../common/properties';

import { ActionsSchema } from '../../../factories/actions/actions.schema';

describe('NGXS Actions', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json')
  );
  it('should manage name only', async () => {
    const options: ActionsSchema = {
      name: 'todos'
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync(FACTORIES.ACTIONS, options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual(['/src/todos/todos.actions.ts']);
  });

  it('should error when name is empty', async () => {
    await propertyNotEmpty(runner, FACTORIES.ACTIONS, 'name');
  });
});
