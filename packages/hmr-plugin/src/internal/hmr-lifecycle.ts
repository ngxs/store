import { Observable, Subscription } from 'rxjs';

import { CallStackFrame, HmrStatus, NgxsHmrLifeCycle } from '../symbols';
import { HmrStorage } from './hmr-storage';
import { HmrStoreContext } from './hmr-store-context';
import { HmrOptionBuilder } from './hmr-options-builder';

export class HmrLifecycle<T extends NgxsHmrLifeCycle<S>, S> {
  public readonly status: HmrStatus = {
    onInitIsCalled: false,
    beforeOnDestroyIsCalled: false
  };

  private storage: HmrStorage<S>;
  private context: HmrStoreContext<T, S>;
  private optionsBuilder: HmrOptionBuilder<T, S>;
  private ngAppModule: T;

  constructor(
    type: T,
    storage: HmrStorage<S>,
    context: HmrStoreContext<T, S>,
    builder: HmrOptionBuilder<T, S>
  ) {
    this.ngAppModule = type;
    this.storage = storage;
    this.context = context;
    this.optionsBuilder = builder;
  }

  public hmrNgxsStoreOnInit(hmrAfterOnInit: () => void) {
    if (typeof this.ngAppModule.hmrNgxsStoreOnInit === 'function') {
      this.stateEventLoop((ctx, state) => {
        this.ngAppModule.hmrNgxsStoreOnInit(ctx, state);
        this.status.onInitIsCalled = true;
        hmrAfterOnInit();
      });
    }
  }

  public hmrNgxsStoreBeforeOnDestroy(): Partial<S> {
    let resultSnapshot: Partial<S> = {};
    if (typeof this.ngAppModule.hmrNgxsStoreBeforeOnDestroy === 'function') {
      resultSnapshot = this.ngAppModule.hmrNgxsStoreBeforeOnDestroy(this.context.stateContext);
    }

    this.status.beforeOnDestroyIsCalled = true;

    return resultSnapshot;
  }

  private stateEventLoop(frame: CallStackFrame<S>) {
    if (this.storage.existHmrStorage) {
      const appBootstrapped$: Observable<unknown> = this.context.bootstrap.appBootstrapped$;
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
            frame(this.context.stateContext, this.storage.snapshot);
          }, this.optionsBuilder.deferTime);
        });
      });
    }
  }
}
