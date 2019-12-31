import { TokenName } from './symbols';
import { ensureSelectorMetadata, RuntimeSelectorContext } from '../internal/internals';

export class StateToken<T = void> {
  constructor(private readonly name: TokenName<T>) {
    const selectorMetadata = ensureSelectorMetadata(<any>this);
    selectorMetadata.selectFromAppState = (
      state: any,
      runtimeContext: RuntimeSelectorContext
    ): T => {
      return runtimeContext.getStateGetter(this.name)(state);
    };
  }

  getName(): string {
    return this.name;
  }

  toString(): string {
    return `StateToken[${this.name}]`;
  }
}
