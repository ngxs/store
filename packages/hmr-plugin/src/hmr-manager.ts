import { ApplicationRef, ComponentRef, NgModuleRef } from '@angular/core';
import { createNewHosts, removeNgStyles } from '@angularclass/hmr';
import { NgxsBootstrapper, NgxsHmrRuntime, HmrSnapshot } from '@ngxs/store/internals';

import { BootstrapModuleFn, NgxsHmrLifeCycle, NgxsHmrOptions, WebpackModule } from './symbols';
import { HmrStateContextFactory } from './internal/hmr-state-context-factory';
import { HmrOptionBuilder } from './internal/hmr-options-builder';
import { HmrInitAction } from './actions/hmr-init.action';
import { HmrLifecycle } from './internal/hmr-lifecycle';

export class HmrManager<T extends Partial<NgxsHmrLifeCycle<S>>, S = HmrSnapshot> {
  public context: HmrStateContextFactory<T, S>;
  public lifecycle: HmrLifecycle<T, S>;
  public optionsBuilder: HmrOptionBuilder;
  private ngModule: NgModuleRef<T>;

  constructor(private readonly module: WebpackModule, options: NgxsHmrOptions) {
    this.optionsBuilder = new HmrOptionBuilder(options);
  }

  public async hmrModule(
    bootstrapFn: BootstrapModuleFn<T>,
    tick: () => void
  ): Promise<NgModuleRef<T>> {
    this.ngModule = await bootstrapFn();
    this.context = new HmrStateContextFactory(this.ngModule);
    this.lifecycle = this.createLifecycle();

    tick();

    return this.ngModule;
  }

  public beforeModuleBootstrap(): void {
    this.lifecycle.hmrNgxsStoreOnInit((ctx, state) => {
      NgxsHmrRuntime.clear();
      ctx.dispatch(new HmrInitAction(state));
    });
  }

  public beforeModuleOnDestroy(): void {
    this.optionsBuilder.clearLogs();
    NgxsHmrRuntime.snapshot = this.lifecycle.hmrNgxsStoreBeforeOnDestroy();
  }

  public createNewModule(): void {
    const appRef: ApplicationRef = this.ngModule.injector.get(ApplicationRef);
    const elements: ComponentRef<any>[] = appRef.components.map(c => c.location.nativeElement);
    const createNewModule: () => void = createNewHosts(elements);
    removeNgStyles();
    createNewModule();
  }

  private createLifecycle(): HmrLifecycle<T, S> {
    const ngAppModule = this.ngModule.instance;
    const context = this.context;
    const bootstrap = this.ngModule.injector.get(NgxsBootstrapper);
    const builder = this.optionsBuilder;
    return new HmrLifecycle(ngAppModule, bootstrap, context, builder);
  }
}
