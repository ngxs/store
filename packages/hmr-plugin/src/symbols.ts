import { StateContext } from '@ngxs/store';
import { NgModuleRef } from '@angular/core';

export const enum HmrRuntime {
  Status = 'NGXS_HMR_LIFECYCLE_STATUS'
}

export interface NgxsHmrSnapshot {
  [key: string]: any;
}

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
   * Clear logs after each refresh
   * (default: true)
   */
  autoClearLogs?: boolean;

  /**
   * @description
   * Deferred time before loading the old state
   * (default: 100ms)
   */
  deferTime?: number;
}

type ModuleId = string | number;
interface WebpackHotModule {
  hot?: {
    data: any;
    accept(dependencies: string[], callback?: (updatedDependencies: ModuleId[]) => void): void;
    accept(dependency: string, callback?: () => void): void;
    accept(errHandler?: (err: Error) => void): void;
    dispose(callback: (data: any) => void): void;
  };
}

/**
 * @description
 * any - because need setup
 * npm i @types/webpack-env
 */
export type WebpackModule = WebpackHotModule | any;
