import { TokenName } from './symbols';
import { ensureSelectorMetadata, RuntimeSelectorContext } from '../internal/internals';

export class StateToken<T = void> {
  constructor(private readonly name: TokenName<T>) {
    const selectorMetadata = ensureSelectorMetadata(<any>this);
    selectorMetadata.makeRootSelector = (
      runtimeContext: RuntimeSelectorContext
    ): ((state: any) => T) => {
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
