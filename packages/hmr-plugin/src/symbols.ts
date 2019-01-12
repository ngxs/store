import { StateContext } from '@ngxs/store';

export interface NgxsStoreSnapshot {
  [key: string]: any;
}

export const NGXS_HMR_SNAPSHOT_KEY = '__NGXS_HMR_SNAPSHOT__';

export interface NgxsHmrLifeCycle<T = NgxsStoreSnapshot> {
  /**
   * hmrNgxsStoreOnInit is called when the AppModule on init
   * @param context - StateContext for the current app state from Store
   * @param snapshot - previous state from Store after last hmr on destroy
   */
  hmrNgxsStoreOnInit(context: StateContext<T>, snapshot: Partial<T>): void;

  /**
   * hmrNgxsStoreOnInit is called when the AppModule on destroy
   * @param context - current state from Store
   */
  hmrNgxsStoreBeforeOnDestroy(context: StateContext<T>): T;
}

export type HmrNgxsStoreOnInit<T> = (context: StateContext<T>, snapshot: Partial<T>) => void;
export type CallStackFrame<T> = (prevState: Partial<T>, ctx: StateContext<T>) => void;
