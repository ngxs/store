import { NGXS_HMR_SNAPSHOT_KEY } from '../symbols';

export class HmrStorage<S> {
  private readonly keyStore: string = NGXS_HMR_SNAPSHOT_KEY;

  public resetHmrStorageWhenEmpty(): void {
    if (!this.existHmrStorage) {
      this.snapshot = {};
    }
  }

  public get existHmrStorage(): boolean {
    return Object.keys(this.snapshot).length > 0;
  }

  public get snapshot(): Partial<S> {
    return JSON.parse(sessionStorage.getItem(this.keyStore) || '{}');
  }

  /**
   * @description
   * Session storage: max size - 5 MB, in future need usage IndexDB (50Mb+)
   * Session storage is used so that lazy modules can also be updated.
   */
  public set snapshot(value: Partial<S>) {
    sessionStorage.setItem(this.keyStore, JSON.stringify(value));
  }
}
