import { TokenName } from './symbols';

export class StateToken<T> {
  protected constructor(public readonly name: string) {}

  public static create<U = void>(name: TokenName<U>): StateToken<U> {
    return new StateToken<U>(name);
  }

  public select(state: T): (state: T) => T {
    return () => state;
  }

  public toString(): string {
    return this.name;
  }
}
