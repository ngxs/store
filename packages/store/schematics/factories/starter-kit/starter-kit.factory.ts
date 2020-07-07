import { Rule } from '@angular-devkit/schematics';
import { StarterKitSchema } from './starter-kit.schema';
import { FACTORIES } from '../../utils';
import { factoryLoader } from '../../utils/factory-loader';

export function starterKit(options: StarterKitSchema): Rule {
  return factoryLoader<StarterKitSchema>(options, FACTORIES.STARTER_KIT);
}
