import { Rule } from '@angular-devkit/schematics';
import { ActionsSchema } from './actions.schema';
import { FACTORIES } from '../../utils';
import { factoryLoader } from '../../utils/factory-loader';

export function actions(options: ActionsSchema): Rule {
  return factoryLoader<ActionsSchema>(options, FACTORIES.ACTIONS);
}
