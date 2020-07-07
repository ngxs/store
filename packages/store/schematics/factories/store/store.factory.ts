import { Rule } from '@angular-devkit/schematics';
import { StoreSchema } from './store.schema';
import { FACTORIES } from '../../utils';
import { factoryLoader } from '../../utils/factory-loader';

export function store(options: StoreSchema): Rule {
  return factoryLoader<StoreSchema>(options, FACTORIES.STORE);
}
