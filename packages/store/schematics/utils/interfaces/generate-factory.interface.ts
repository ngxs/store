import { FACTORIES } from '../common/factories.enum';

export interface SchemaOptions {
  path: string;
  spec: boolean;
}

export interface GenerateFactoryInterface {
  options: Partial<SchemaOptions>;
  factory: FACTORIES;
  isSpec: boolean;
}
