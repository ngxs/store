import { RepairType } from './utils';

export type Predicate<T = any> = (value?: RepairType<T>) => boolean;
