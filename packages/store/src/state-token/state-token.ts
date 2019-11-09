import { TokenName } from './symbols';

export class StateToken<T> {
  protected constructor(private readonly name: TokenName<T>) {}

  public static create<U = void>(name: TokenName<U>): StateToken<U> {
    return new StateToken<U>(name);
  }

  public getName(): string {
    return this.name;
  }

  public toString(): string {
    return `StateToken[${this.name}]`;
  }
}
