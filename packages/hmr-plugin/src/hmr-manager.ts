import { ApplicationRef, ComponentRef, NgModuleRef } from '@angular/core';
import { createNewHosts, hmrModule } from '@angularclass/hmr';
import { NgxsBootstrapper } from '@ngxs/store/internals';

import {
  BootstrapModuleType,
  NgxsHmrLifeCycle,
  NgxsHmrOptions,
  NgxsHmrSnapshot,
  WebpackModule
} from './symbols';

import { HmrStorage } from './internal/hmr-storage';
import { HmrStateContextFactory } from './internal/hmr-state-context-factory';
import { HmrLifecycle } from './internal/hmr-lifecycle';
import { HmrOptionBuilder } from './internal/hmr-options-builder';
import { HmrInitAction } from './actions/hmr-init.action';

export class HmrManager<T extends NgxsHmrLifeCycle<S>, S = NgxsHmrSnapshot> {
  public storage: HmrStorage<S>;
  public context: HmrStateContextFactory<T, S>;
  public lifecycle: HmrLifecycle<T, S>;
  public optionsBuilder: HmrOptionBuilder<T, S>;

  private ngModule: NgModuleRef<T>;

  constructor(private readonly module: WebpackModule, options: NgxsHmrOptions<T, S>) {
    this.storage = new HmrStorage<S>();
    this.optionsBuilder = new HmrOptionBuilder(options);
    this.storage.resetHmrStorageWhenEmpty();
  }

  public async hmrModule(bootstrap: BootstrapModuleType<T>, tick: () => void): Promise<any> {
    this.ngModule = await bootstrap();
    this.context = new HmrStateContextFactory(this.ngModule);
    this.lifecycle = this.createLifecycle();

    tick();

    return await hmrModule(this.ngModule, this.module);
  }

  private createLifecycle(): HmrLifecycle<T, S> {
    const ngAppModule = this.ngModule.instance;
    const storage = this.storage;
    const context = this.context;
    const bootstrap = this.ngModule.injector.get(NgxsBootstrapper);
    const builder = this.optionsBuilder;
    return new HmrLifecycle(ngAppModule, bootstrap, storage, context, builder);
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
}
