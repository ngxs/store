import { TokenName } from './symbols';
import { ensureSelectorMetadata, propGetter } from '../internal/internals';
import { SelectFactory } from '../decorators/select/select-factory';

export class StateToken<T> {
  protected constructor(private readonly name: string) {
    const selectorMetadata = ensureSelectorMetadata(<any>this);
    selectorMetadata.selectFromAppState = (state: any): T => {
      // This is lazy initialized with the select from app state function
      // so that it can get the config at the last responsible moment
      const getter = propGetter([this.name], SelectFactory.config!);
      selectorMetadata.selectFromAppState = getter;
      return getter(state);
    };
  }

  /**
   * @description
   * Single entry point to create a token.
   * @param name - state name
   */
  public static create<U = void>(name: TokenName<U>): StateToken<U> {
    return new StateToken<U>(name);
  }

  public getName(): string {
    return this.name;
  }

  /**
   * @description
   * Hide the ability to serialize a token.
   */
  public toString(): string {
    return `StateToken[${this.name}]`;
  }

  /**
   * @description
   * Expose a fake method that returns the type T
   * so that TS did not ignore the generic parameter.
   */
  protected _$implicitType(model: T): T {
    return model;
  }
}
