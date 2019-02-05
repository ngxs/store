import { NgxsBootstrapper } from '@ngxs/store/internals';
import { Observable, Subscription } from 'rxjs';
import { StateContext } from '@ngxs/store';

import { HmrOptionBuilder } from './hmr-options-builder';
import { HmrCallback, NgxsHmrLifeCycle } from '../symbols';
import { HmrStateContextFactory } from './hmr-state-context-factory';
import { HmrBeforeDestroyAction } from '../actions/hmr-before-destroy.action';
import { HmrStorage } from './hmr-storage';

export class HmrLifecycle<T extends NgxsHmrLifeCycle<S>, S> {
  constructor(
    private ngAppModule: T,
    private bootstrap: NgxsBootstrapper,
    private storage: HmrStorage<S>,
    private context: HmrStateContextFactory<T, S>,
    private options: HmrOptionBuilder<T, S>
  ) {}

  public hmrNgxsStoreOnInit(hmrAfterOnInit: HmrCallback<S>) {
    if (typeof this.ngAppModule.hmrNgxsStoreOnInit === 'function') {
      this.stateEventLoop((ctx, state) => {
        this.ngAppModule.hmrNgxsStoreOnInit(ctx, state);
        hmrAfterOnInit(ctx, state);
      });
    }
  }

  public hmrNgxsStoreBeforeOnDestroy(): Partial<S> {
    let state: Partial<S> = {};
    const ctx: StateContext<S> = this.context.createStateContext();
    if (typeof this.ngAppModule.hmrNgxsStoreBeforeOnDestroy === 'function') {
      state = this.ngAppModule.hmrNgxsStoreBeforeOnDestroy(ctx);
    }

    ctx.dispatch(new HmrBeforeDestroyAction(state));
    return state;
  }

  private stateEventLoop(callback: HmrCallback<S>): void {
    if (!this.storage.existHmrStorage) return;

    const appBootstrapped$: Observable<unknown> = this.bootstrap.appBootstrapped$;
    const state$: Observable<unknown> = this.context.store.select(state => state);

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
          callback(this.context.createStateContext(), this.storage.snapshot);
        }, this.options.deferTime);
      });
    });
  }
}
