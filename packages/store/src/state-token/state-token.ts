import { TokenName } from './symbols';
import {
  ensureSelectorMetadata,
  RuntimeSelectorContext,
  SelectFromRootState
} from '../internal/internals';

export class StateToken<T = void> {
  constructor(private readonly name: TokenName<T>) {
    const selectorMetadata = ensureSelectorMetadata(<any>this);
    selectorMetadata.makeRootSelector = (
      runtimeContext: RuntimeSelectorContext
    ): SelectFromRootState => {
      return runtimeContext.getStateGetter(this.name);
    };
  }

  getName(): string {
    return this.name;
  }

  toString(): string {
    return `StateToken[${this.name}]`;
  }
}
