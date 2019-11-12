import { TokenName } from './symbols';
import { ensureSelectorMetadata, propGetter } from '../internal/internals';
import { SelectFactory } from '../decorators/select/select-factory';

export class StateToken<T = void> {
  constructor(private readonly name: TokenName<T>) {
    const selectorMetadata = ensureSelectorMetadata(<any>this);
    selectorMetadata.selectFromAppState = (state: any): T => {
      // This is lazy initialized with the select from app state function
      // so that it can get the config at the last responsible moment
      const getter = propGetter([this.name], SelectFactory.config!);
      selectorMetadata.selectFromAppState = getter;
      return getter(state);
    };
  }

  getName(): string {
    return this.name;
  }

  toString(): string {
    return `StateToken[${this.name}]`;
  }
}
