import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { FACTORIES } from '../../../utils';
import { StarterKitSchema } from '../../../factories/starter-kit/starter-kit.schema';

describe('Generate ngxs starter kit', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json')
  );
  it('should generate store in default root folder', async () => {
    const options: StarterKitSchema = {
      spec: true
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync(FACTORIES.STARTER_KIT, options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/src/store/store.config.ts',
      '/src/store/store.module.ts',
      '/src/store/auth/auth.actions.ts',
      '/src/store/auth/auth.state.spec.ts',
      '/src/store/auth/auth.state.ts',
      '/src/store/dashboard/index.ts',
      '/src/store/dashboard/states/dictionary/dictionary.actions.ts',
      '/src/store/dashboard/states/dictionary/dictionary.state.spec.ts',
      '/src/store/dashboard/states/dictionary/dictionary.state.ts',
      '/src/store/dashboard/states/user/user.actions.ts',
      '/src/store/dashboard/states/user/user.state.spec.ts',
      '/src/store/dashboard/states/user/user.state.ts'
    ]);
  });

  it('should generate store in default root folder with spec false', async () => {
    const options: StarterKitSchema = {
      spec: false
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync(FACTORIES.STARTER_KIT, options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/src/store/store.config.ts',
      '/src/store/store.module.ts',
      '/src/store/auth/auth.actions.ts',
      '/src/store/auth/auth.state.ts',
      '/src/store/dashboard/index.ts',
      '/src/store/dashboard/states/dictionary/dictionary.actions.ts',
      '/src/store/dashboard/states/dictionary/dictionary.state.ts',
      '/src/store/dashboard/states/user/user.actions.ts',
      '/src/store/dashboard/states/user/user.state.ts'
    ]);
  });
});
