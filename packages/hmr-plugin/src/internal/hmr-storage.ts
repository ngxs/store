export class HmrStorage<S> {
  constructor(private _snapshot: Partial<S> = {}) {}

  public hasData(): boolean {
    return Object.keys(this._snapshot).length > 0;
  }

  public get snapshot(): Partial<S> {
    return this._snapshot;
  }
}
