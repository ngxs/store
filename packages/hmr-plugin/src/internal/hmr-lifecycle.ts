import { ɵNgxsAppBootstrappedState } from '@ngxs/store/internals';
import { Observable, Subscription } from 'rxjs';
import { StateContext } from '@ngxs/store';

import { HmrOptionBuilder } from './hmr-options-builder';
import { HmrCallback, NgxsHmrLifeCycle } from '../symbols';
import { HmrStateContextFactory } from './hmr-state-context-factory';
import { HmrBeforeDestroyAction } from '../actions/hmr-before-destroy.action';
import { HmrStorage } from './hmr-storage';

export class HmrLifecycle<T extends Partial<NgxsHmrLifeCycle<S>>, S> {
  constructor(
    private ngAppModule: T,
    private appBootstrappedState: ɵNgxsAppBootstrappedState,
    private storage: HmrStorage<S>,
    private context: HmrStateContextFactory<T, S>,
    private options: HmrOptionBuilder
  ) {}

  public hmrNgxsStoreOnInit(hmrAfterOnInit: HmrCallback<S>) {
    let moduleHmrInit: HmrCallback<S> = this.getModuleHmrInitCallback();
    moduleHmrInit = moduleHmrInit.bind(this.ngAppModule);
    this.detectIvyWithJIT();
    this.stateEventLoop((ctx, state) => {
      moduleHmrInit(ctx, state);
      hmrAfterOnInit(ctx, state);
    });
  }

  private getModuleHmrInitCallback(): HmrCallback<S> {
    if (typeof this.ngAppModule.hmrNgxsStoreOnInit === 'function') {
      return this.ngAppModule.hmrNgxsStoreOnInit;
    }
    return function defaultModuleHmrInit(ctx, state) {
      ctx.patchState(state);
    };
  }

  public hmrNgxsStoreBeforeOnDestroy(): Partial<S> {
    let state: Partial<S> = {};
    const ctx: StateContext<S> = this.context.createStateContext();
    if (typeof this.ngAppModule.hmrNgxsStoreBeforeOnDestroy === 'function') {
      state = this.ngAppModule.hmrNgxsStoreBeforeOnDestroy(ctx);
    } else {
      state = ctx.getState() as Partial<S>;
    }

    ctx.dispatch(new HmrBeforeDestroyAction(state));
    return state;
  }

  private stateEventLoop(callback: HmrCallback<S>): void {
    if (!this.storage.hasData()) return;

    const state$: Observable<any> = this.context.store.select(state => state);

    this.appBootstrappedState.subscribe(() => {
      let eventId: number;
      const storeEventId: Subscription = state$.subscribe(() => {
        // setTimeout used for zone detection after set hmr state
        clearInterval(eventId);
        eventId = window.setTimeout(() => {
          // close check on the message queue
          storeEventId.unsubscribe();
          // if events are no longer running on the call stack,
          // then we can update the state
          callback(this.context.createStateContext(), this.storage.snapshot as Partial<S>);
        }, this.options.deferTime);
      });
    });
  }

  private detectIvyWithJIT(): void {
    const jit: boolean = this.ngAppModule.constructor.hasOwnProperty('__annotations__');
    const ivy: boolean = this.ngAppModule.constructor.hasOwnProperty('ɵmod');
    if (jit && ivy) {
      throw new Error(
        `@ngxs/hmr-plugin doesn't work with JIT mode in Angular Ivy. Please use AOT mode.`
      );
    }
  }
}
