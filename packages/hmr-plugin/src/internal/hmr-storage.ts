import { NGXS_HMR_SNAPSHOT_KEY } from '../symbols';

export class HmrStorage<S> {
  private _snapshot: Partial<S> = {};

  public clear(): void {
    if (!this.hasData()) {
      this._snapshot = {};
    }
  }

  public hasData(): boolean {
    return Object.keys(this._snapshot).length > 0;
  }

  public get snapshot(): Partial<S> {
    return this._snapshot;
  }

  public set snapshot(value: Partial<S>) {
    this._snapshot = value;
  }
}
