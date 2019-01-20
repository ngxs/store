import { ApplicationRef, ComponentRef, NgModuleRef } from '@angular/core';
import { createNewHosts, hmrModule } from '@angularclass/hmr';
import { isStateOperator } from '@ngxs/store/operators';
import { NgxsBootstrapper } from '@ngxs/store/internals';
import { StateContext, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

import {
  BootstrapModuleType,
  CallStackFrame,
  HmrAfterOnInit,
  HmrStatus,
  NGXS_HMR_SNAPSHOT_KEY,
  NgxsHmrLifeCycle,
  NgxsHmrOptions,
  NgxsHmrSnapshot,
  WebpackModule
} from './symbols';

export class HmrManager<T extends NgxsHmrLifeCycle<S>, S = NgxsHmrSnapshot> {
  public store: Store;
  public readonly status: HmrStatus = {
    onInitIsCalled: false,
    beforeOnDestroyIsCalled: false
  };

  private ngApp: T;
  private ngModule: NgModuleRef<T>;
  private readonly module: WebpackModule;
  private readonly keyStore: string = NGXS_HMR_SNAPSHOT_KEY;
  private readonly deferTime: number;
  private readonly autoClearLogs: boolean;
  private readonly hmrAfterOnInit: HmrAfterOnInit<T, S>;

  constructor(module: WebpackModule, options: NgxsHmrOptions<T, S>) {
    const { deferTime, autoClearLogs, hmrAfterOnInit } = options;
    this.module = module;
    this.deferTime = deferTime || 100;
    this.hmrAfterOnInit = hmrAfterOnInit || ((_: HmrManager<T, S>) => {});
    this.autoClearLogs = autoClearLogs === undefined ? true : autoClearLogs;
    this.validateExistHmrStorage();
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

  /**
   * @description
   * must be taken out into  @ngxs/store/internals
   */
  public get stateContext(): StateContext<S> {
    return {
      dispatch: actions => this.store!.dispatch(actions),
      getState: () => <S>this.store!.snapshot(),
      setState: val => {
        if (isStateOperator(val)) {
          const currentState = this.store!.snapshot();
          val = val(currentState);
        }

        this.store!.reset(val);
        return <S>val;
      },
      patchState: val => {
        const currentState = this.store!.snapshot();
        const newState = { ...currentState, ...(<object>val) };
        this.store!.reset(newState);
        return newState;
      }
    };
  }

  public async hmrModule(bootstrap: BootstrapModuleType<T>, tick: () => void): Promise<any> {
    this.ngModule = await bootstrap();
    this.ngApp = this.ngModule.instance;
    tick();

    return await hmrModule(this.ngModule, this.module);
  }

  public beforeModuleBootstrap(): void {
    this.store = this.getStore();
    this.hmrNgxsStoreOnInit();
  }

  public beforeModuleOnDestroy(): void {
    this.clearLogs();
    this.snapshot = this.hmrNgxsStoreBeforeOnDestroy();
    this.status.beforeOnDestroyIsCalled = true;
  }

  public createNewHosts(): void {
    const appRef: ApplicationRef = this.ngModule.injector.get(ApplicationRef);
    const elements: ComponentRef<any>[] = appRef.components.map(c => c.location.nativeElement);
    const creator: () => void = createNewHosts(elements);
    creator();
  }

  public hmrNgxsStoreBeforeOnDestroy(): Partial<S> {
    let resultSnapshot: Partial<S> = {};
    if (typeof this.ngApp.hmrNgxsStoreBeforeOnDestroy === 'function') {
      resultSnapshot = this.ngApp.hmrNgxsStoreBeforeOnDestroy(this.stateContext);
    }

    return resultSnapshot;
  }

  public hmrNgxsStoreOnInit() {
    if (typeof this.ngApp.hmrNgxsStoreOnInit === 'function') {
      this.stateEventLoop((ctx, state) => {
        this.ngApp.hmrNgxsStoreOnInit(ctx, state);
        this.status.onInitIsCalled = true;
        this.hmrAfterOnInit(this);
        this.snapshot = {};
      });
    } else {
      this.hmrAfterOnInit(this);
    }
  }

  private clearLogs(): void {
    if (this.autoClearLogs) {
      console.clear();
      console.log('[NGXS HMR] clear old logs...');
    }
  }

  private getStore(): Store {
    const store = this.ngModule.injector.get(Store, null);

    if (!store) {
      throw new Error('Store not found, maybe you forgot to import the NgxsModule');
    }

    return store;
  }

  private stateEventLoop(frame: CallStackFrame<S>) {
    if (this.existHmrStorage) {
      const bootstrap: NgxsBootstrapper = this.ngModule.injector.get(NgxsBootstrapper);
      const appBootstrapped$: Observable<unknown> = bootstrap.appBootstrapped$;
      const state$: Observable<unknown> = this.store.select(state => state);

      appBootstrapped$.subscribe(() => {
        let eventId: number;
        const storeEventId: Subscription = state$.subscribe(() => {
          // setTimeout used for zone detection after set hmr state
          clearInterval(eventId);
          eventId = window.setTimeout(() => {
            // close check on the message queue
            storeEventId.unsubscribe();
            // if events are no longer running on the call stack,
            // then we can update the state
            frame(this.stateContext, this.snapshot);
          }, this.deferTime);
        });
      });
    }
  }

  private validateExistHmrStorage(): void {
    if (!this.existHmrStorage) {
      this.snapshot = {};
    }
  }
}
