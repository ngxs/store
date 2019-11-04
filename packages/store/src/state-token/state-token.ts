import { StateClassToken, StateTokenStructure, TokenName } from './symbols';
import { getStoreMetadata, MetaDataModel, StateClassInternal } from '../internal/internals';

export class StateToken<T> {
  private static tokenMap: Map<string, StateTokenStructure> = new Map();
  private _stateClass: Readonly<StateClassInternal>;

  public set stateClass(stateClass: Readonly<StateClassInternal>) {
    this._stateClass = stateClass;
  }

  public get stateClass(): Readonly<StateClassInternal> {
    return this._stateClass;
  }

  protected constructor(public readonly name: string) {}

  public static create<U = void>(name: TokenName<U>): StateToken<U> {
    let tokenInstance: StateToken<U> | null = null;

    if (this.tokenMap.has(name)) {
      throw new Error(`StateToken ${name} is already initialized`);
    } else {
      tokenInstance = new StateToken<U>(name);
      StateToken.tokenMap.set(name, { name, tokenInstance });
    }

    return tokenInstance!;
  }

  public static inject<U = void>(token: TokenName<U> | StateClassToken<U>): StateToken<U> {
    const meta: MetaDataModel | null = getStoreMetadata(token as any) || null;
    const tokenName: string | null = meta ? meta.name : (token as string),
      structure: StateTokenStructure | undefined = StateToken.tokenMap.get(tokenName!);
    return structure ? structure.tokenInstance : null!;
  }

  public static clear(): void {
    StateToken.tokenMap.clear();
  }

  public select(state: T): (state: T) => T {
    return () => state;
  }

  public toString(): string {
    return this.name;
  }
}
