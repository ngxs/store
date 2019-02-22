import { StateContext } from '@ngxs/store';
import { NgModuleRef } from '@angular/core';

export interface NgxsHmrSnapshot {
  [key: string]: any;
}

export const NGXS_HMR_SNAPSHOT_KEY = '__NGXS_HMR_SNAPSHOT__';

export interface NgxsHmrLifeCycle<T = NgxsHmrSnapshot> {
  /**
   * hmrNgxsStoreOnInit is called when the AppModule on init
   * @param ctx - StateContext for the current app state from Store
   * @param snapshot - previous state from Store after last hmr on destroy
   */
  hmrNgxsStoreOnInit(ctx: StateContext<T>, snapshot: Partial<T>): void;

  /**
   * hmrNgxsStoreOnInit is called when the AppModule on destroy
   * @param ctx - StateContext for the current app state from Store
   */
  hmrNgxsStoreBeforeOnDestroy(ctx: StateContext<T>): Partial<T>;
}

export type HmrCallback<T> = (ctx: StateContext<T>, state: Partial<T>) => void;
export type BootstrapModuleFn<T = any> = () => Promise<NgModuleRef<T>>;

export interface NgxsHmrOptions {
  /**
   * @description
   * clear log after each hmr update
   * (default: true)
   */
  autoClearLogs?: boolean;

  /**
   * @description
   * deferred time before loading the old state
   * (default: 100ms)
   */
  deferTime?: number;
}

interface HotModule {
  hot: {
    accept(path?: () => void, callback?: () => void): void;
    dispose(callback?: () => void): void;
  };
}

/**
 * @description
 * any - because need setup
 * npm i @types/webpack-env
 */
export type WebpackModule = HotModule | any;
