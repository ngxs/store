import {
  DestroyRef,
  inject,
  Injectable,
  Injector,
  runInInjectionContext
} from '@angular/core';
import { NgxsNextPluginFn, NgxsPlugin, registerNgxsPlugin } from '@ngxs/store';

export const recorder: any[] = [];

@Injectable()
class LazyNgxsPlugin implements NgxsPlugin {
  constructor() {
    inject(DestroyRef).onDestroy(() => recorder.push('LazyNgxsPlugin.destroy()'));
  }

  handle(state: any, action: any, next: NgxsNextPluginFn) {
    recorder.push({ state, action });
    return next(state, action);
  }
}

export function registerPluginFixture(injector: Injector) {
  runInInjectionContext(injector, () => registerNgxsPlugin(LazyNgxsPlugin));
}
