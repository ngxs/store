import { ApplicationRef, ComponentRef, NgModuleRef } from '@angular/core';
import { InitialState, NgxsBootstrapper } from '@ngxs/store/internals';

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

type OldHostRemoverFn = () => void;

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

  private get applicationRef(): ApplicationRef {
    return this.ngModule.injector.get(ApplicationRef);
  }

  private get bootstrap(): NgxsBootstrapper {
    return this.ngModule.injector.get(NgxsBootstrapper);
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
    const removeOldHosts: () => void = this.cloneHostsBeforeDestroy();
    this.removeNgStyles();
    this.ngModule.destroy();
    removeOldHosts();
  }

  private createLifecycle(): HmrLifecycle<T, S> {
    return new HmrLifecycle(
      this.ngModule.instance,
      this.bootstrap,
      this.storage,
      this.context,
      this.optionsBuilder
    );
  }

  private cloneHostsBeforeDestroy(): () => void {
    const elements: Element[] = this.applicationRef.components.map(
      (component: ComponentRef<Element>) => component.location.nativeElement
    );

    const removableList: OldHostRemoverFn[] = elements.map((componentNode: Element) => {
      const newNode = document.createElement(componentNode.tagName);
      const parentNode: Node = componentNode.parentNode as Node;
      const currentDisplay: string | null = newNode.style.display;

      newNode.style.display = 'none';
      parentNode.insertBefore(newNode, componentNode);

      return (): void => {
        newNode.style.display = currentDisplay;
        try {
          parentNode.removeChild(componentNode);
        } catch {}
      };
    });

    return function removeOldHosts(): void {
      removableList.forEach((removeOldHost: OldHostRemoverFn) => removeOldHost());
    };
  }

  private removeNgStyles(): void {
    const head: HTMLHeadElement = document.head!;
    const styles: HTMLStyleElement[] = Array.from(head!.querySelectorAll('style'));

    styles
      .filter((style: HTMLStyleElement) => style.innerText.includes('_ng'))
      .map((style: HTMLStyleElement) => head!.removeChild(style));
  }
}
