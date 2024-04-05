import { ɵensureSelectorMetadata } from './metadata';
import type { ɵTokenName, ɵSelectFromRootState, ɵRuntimeSelectorContext } from './symbols';

export class StateToken<T = void> {
  constructor(private readonly _name: ɵTokenName<T>) {
    const selectorMetadata = ɵensureSelectorMetadata(<any>this);
    selectorMetadata.makeRootSelector = (
      runtimeContext: ɵRuntimeSelectorContext
    ): ɵSelectFromRootState => {
      return runtimeContext.getStateGetter(this._name);
    };
  }

  getName(): string {
    return this._name;
  }

  toString(): string {
    return `StateToken[${this._name}]`;
  }
}
