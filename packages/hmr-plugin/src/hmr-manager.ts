import { ApplicationRef, ComponentRef, NgModuleRef } from '@angular/core';
import { InitialState, NgxsBootstrapper } from '@ngxs/store/internals';
import { createNewHosts, removeNgStyles } from '@angularclass/hmr';

import { HmrStorage } from './internal/hmr-storage';
import {
  BootstrapModuleFn,
  NgxsHmrLifeCycle,
  NgxsHmrOptions,
  NgxsHmrSnapshot
} from './symbols';
import { HmrStateContextFactory } from './internal/hmr-state-context-factory';
import { HmrOptionBuilder } from './internal/hmr-options-builder';
import { HmrInitAction } from './actions/hmr-init.action';
import { HmrLifecycle } from './internal/hmr-lifecycle';

export class HmrManager<T extends Partial<NgxsHmrLifeCycle<S>>, S = NgxsHmrSnapshot> {
  public storage: HmrStorage<S>;
  public context: HmrStateContextFactory<T, S>;
  public lifecycle: HmrLifecycle<T, S>;
  public optionsBuilder: HmrOptionBuilder;
  private ngModule: NgModuleRef<T>;

  constructor(options: NgxsHmrOptions, storage: HmrStorage<S>) {
    this.storage = storage;
    this.optionsBuilder = new HmrOptionBuilder(options);
  }

  public async hmrModule(
    bootstrapFn: BootstrapModuleFn<T>,
    tick: () => void
  ): Promise<NgModuleRef<T>> {
    InitialState.set(this.storage.snapshot);
    this.ngModule = await bootstrapFn();
    this.context = new HmrStateContextFactory(this.ngModule);
    this.lifecycle = this.createLifecycle();

    tick();

    InitialState.pop();
    return this.ngModule;
  }

  public beforeModuleBootstrap(): void {
    this.lifecycle.hmrNgxsStoreOnInit((ctx, state) => {
      ctx.dispatch(new HmrInitAction(state));
    });
  }

  public beforeModuleOnDestroy(): Partial<S> {
    this.optionsBuilder.clearLogs();
    return this.lifecycle.hmrNgxsStoreBeforeOnDestroy();
  }

  public createNewModule(): void {
    const appRef: ApplicationRef = this.ngModule.injector.get(ApplicationRef);
    const elements: ComponentRef<any>[] = appRef.components.map(c => c.location.nativeElement);
    const createNewModule: () => void = createNewHosts(elements);
    removeNgStyles();
    this.ngModule.destroy();
    createNewModule();
  }

  private createLifecycle(): HmrLifecycle<T, S> {
    const ngAppModule = this.ngModule.instance;
    const storage = this.storage;
    const context = this.context;
    const bootstrap = this.ngModule.injector.get(NgxsBootstrapper);
    const builder = this.optionsBuilder;
    return new HmrLifecycle(ngAppModule, bootstrap, storage, context, builder);
  }
}
