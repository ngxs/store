import { StateOperations } from '@ngxs/store';
import { NgModuleRef } from '@angular/core';

export interface NgxsStoreSnapshot<T = any> {
  [key: string]: T | T[];
}

export const NGXS_HMR_SNAPSHOT_KEY = '__NGXS_HMR_SNAPSHOT__';

export interface NgxsHmrLifeCycle<T = NgxsStoreSnapshot> {
  /**
   * hmrNgxsStoreOnInit is called when the AppModule on init
   * @param context - current state from Store
   * @param snapshot - previous state from Store after last hmr on destroy
   */
  hmrNgxsStoreOnInit(context: StateOperations<T>, snapshot: Partial<T>): void;

  /**
   * hmrNgxsStoreOnInit is called when the AppModule on destroy
   * @param context - current state from Store
   */
  hmrNgxsStoreBeforeOnDestroy(context: StateOperations<T>): T;
}
