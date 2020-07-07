import { Rule } from '@angular-devkit/schematics';
import { StateSchema } from './state.schema';
import { FACTORIES } from '../../utils';
import { factoryLoader } from '../../utils/factory-loader';

export function state(options: StateSchema): Rule {
  return factoryLoader<StateSchema>(options, FACTORIES.STATE);
}
