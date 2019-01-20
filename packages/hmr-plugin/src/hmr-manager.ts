import { ApplicationRef, ComponentRef, NgModuleRef } from '@angular/core';
import { createNewHosts, hmrModule } from '@angularclass/hmr';

import {
  BootstrapModuleType,
  NgxsHmrLifeCycle,
  NgxsHmrOptions,
  NgxsHmrSnapshot,
  WebpackModule
} from './symbols';

import { HmrStorage } from './internal/hmr-storage';
import { HmrStoreContext } from './internal/hmr-store-context';
import { HmrLifecycle } from './internal/hmr-lifecycle';
import { HmrOptionBuilder } from './internal/hmr-options-builder';

export class HmrManager<T extends NgxsHmrLifeCycle<S>, S = NgxsHmrSnapshot> {
  public storage: HmrStorage<S>;
  public context: HmrStoreContext<T, S>;
  public lifecycle: HmrLifecycle<T, S>;
  public optionsBuilder: HmrOptionBuilder<T, S>;

  private ngModule: NgModuleRef<T>;
  private readonly module: WebpackModule;

  constructor(module: WebpackModule, options: NgxsHmrOptions<T, S>) {
    this.module = module;
    this.storage = new HmrStorage<S>();
    this.optionsBuilder = new HmrOptionBuilder(options);
    this.storage.validateExistHmrStorage();
  }

  public async hmrModule(bootstrap: BootstrapModuleType<T>, tick: () => void): Promise<any> {
    this.ngModule = await bootstrap();
    this.context = new HmrStoreContext(this.ngModule);
    this.lifecycle = this.createLifecycle();

    tick();

    return await hmrModule(this.ngModule, this.module);
  }

  private createLifecycle(): HmrLifecycle<T, S> {
    const ngAppModule = this.ngModule.instance;
    const storage = this.storage;
    const context = this.context;
    const builder = this.optionsBuilder;
    return new HmrLifecycle(ngAppModule, storage, context, builder);
  }

  public beforeModuleBootstrap(): void {
    this.lifecycle.hmrNgxsStoreOnInit(() => {
      this.optionsBuilder.hmrAfterOnInit(this);
      this.storage.snapshot = {};
    });
  }

  public beforeModuleOnDestroy(): void {
    this.optionsBuilder.clearLogs();
    this.storage.snapshot = this.lifecycle.hmrNgxsStoreBeforeOnDestroy();
  }

  public createNewHosts(): void {
    const appRef: ApplicationRef = this.ngModule.injector.get(ApplicationRef);
    const elements: ComponentRef<any>[] = appRef.components.map(c => c.location.nativeElement);
    const creator: () => void = createNewHosts(elements);
    creator();
  }
}
