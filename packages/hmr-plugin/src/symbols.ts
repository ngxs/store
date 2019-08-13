import { StateContext } from '@ngxs/store';
import { NgModuleRef } from '@angular/core';

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

export interface WebpackHotApi {
  data: any;
  accept(dependencies: string[], callback?: (updatedDependencies: ModuleId[]) => void): void;
  accept(dependency: string, callback?: () => void): void;
  accept(errHandler?: (err: Error) => void): void;
  dispose(callback: (data: any) => void): void;
  decline(): void;
  status(): string;
  check(): Promise<any>;
  apply(): Promise<any>;
  addStatusHandler(handler: (status: string) => void): void;
  removeStatusHandler(callback: any): void;
}

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

  /**
   * @description
   * Add a handler which is executed when the current module code is replaced.
   * (default: null)
   */
  dispose?: CustomDispose;
}

type ModuleId = string | number;
interface WebpackHotModule {
  hot?: WebpackHotApi;
}

/**
 * @description
 * any - because need setup
 * npm i @types/webpack-env
 */
export type WebpackModule = WebpackHotModule | any;

export type OldHostRemoverFn = () => void;

export interface HmrDataTransfer {
  snapshot?: any;
}

export type CustomDispose = (hotApi: WebpackHotApi) => void;
