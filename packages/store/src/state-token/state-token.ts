import { TokenName } from './symbols';
import { ensureSelectorMetadata, propGetter } from '../internal/internals';
import { SelectFactory } from '../decorators/select/select-factory';

export class StateToken<T> {
  protected constructor(private readonly name: string) {
    const selectorMetadata = ensureSelectorMetadata(<any>this);
    selectorMetadata.selectFromAppState = (state: any) => {
      // This is lazy initialized with the select from app state function
      // so that it can get the config at the last responsible moment
      const getter = propGetter([this.name], SelectFactory.config!);
      selectorMetadata.selectFromAppState = getter;
      return getter(state);
    };
  }

  public static create<U = void>(name: TokenName<U>): StateToken<U> {
    return new StateToken<U>(name);
  }

  public getName(): string {
    return this.name;
  }

  public toString(): string {
    return `StateToken[${this.name}]`;
  }

  // @ts-ignore
  protected aFakeMethodReturningT_ToMakeTSHappy(model: T): T {
    return model;
  }
}
