import { ApplicationRef, ComponentRef, NgModuleRef } from '@angular/core';
import { createNewHosts } from '@angularclass/hmr';
import { NgxsBootstrapper } from '@ngxs/store/internals';

import { HmrStorage } from './internal/hmr-storage';
import { HmrStateContextFactory } from './internal/hmr-state-context-factory';
import { HmrLifecycle } from './internal/hmr-lifecycle';
import { HmrOptionBuilder } from './internal/hmr-options-builder';
import { HmrInitAction } from './actions/hmr-init.action';
import {
  BootstrapModuleFn,
  NgxsHmrLifeCycle,
  NgxsHmrOptions,
  NgxsHmrSnapshot,
  WebpackModule
} from './symbols';

export class HmrManager<T extends Partial<NgxsHmrLifeCycle<S>>, S = NgxsHmrSnapshot> {
  public storage: HmrStorage<S>;
  public context: HmrStateContextFactory<T, S>;
  public lifecycle: HmrLifecycle<T, S>;
  public optionsBuilder: HmrOptionBuilder;
  private ngModule: NgModuleRef<T>;

  constructor(private readonly module: WebpackModule, options: NgxsHmrOptions) {
    this.storage = new HmrStorage<S>();
    this.optionsBuilder = new HmrOptionBuilder(options);
    this.storage.resetHmrStorageWhenEmpty();
  }

  public async hmrModule(
    bootstrapFn: BootstrapModuleFn<T>,
    tick: () => void
  ): Promise<NgModuleRef<T>> {
    this.ngModule = await bootstrapFn();
    this.context = new HmrStateContextFactory(this.ngModule);
    this.lifecycle = this.createLifecycle();

    tick();

    this.module.hot.accept();
    return this.ngModule;
  }

  public beforeModuleBootstrap(): void {
    this.lifecycle.hmrNgxsStoreOnInit((ctx, state) => {
      this.storage.snapshot = {};
      ctx.dispatch(new HmrInitAction(state));
    });
  }

  public beforeModuleOnDestroy(): void {
    this.optionsBuilder.clearLogs();
    this.storage.snapshot = this.lifecycle.hmrNgxsStoreBeforeOnDestroy();
  }

  public createNewModule(): void {
    const appRef: ApplicationRef = this.ngModule.injector.get(ApplicationRef);
    const elements: ComponentRef<any>[] = appRef.components.map(c => c.location.nativeElement);
    const createNewModule: () => void = createNewHosts(elements);
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
