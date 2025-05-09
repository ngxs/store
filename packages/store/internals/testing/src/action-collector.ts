import {
  DestroyRef,
  EnvironmentProviders,
  inject,
  Injectable,
  provideEnvironmentInitializer
} from '@angular/core';
import { Actions, ActionStatus, type ActionContext } from '@ngxs/store';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NgxsActionCollector {
  /**
   * Including this in your providers will
   * set up the the action collector to start collecting actions
   * from before NGXS initializes
   * @example
   * // In your providers declaration for your tests:
   * {
   *   providers: [
   *     NgxsActionCollector.collectActions(),
   *     provideStore([MyState]),
   *   ],
   *   // ...
   * }
   * // and then in your test:
   * const actionCollector = TestBed.inject(NgxsActionCollector);
   * const actionsDispatched = actionCollector.dispatched;
   * const action = actionsDispatched.find(
   *   (item) => item instanceof MyAction
   * );
   * expect(action).toBeDefined();
   * @returns An environment initializer that starts the collector immediately
   */
  static collectActions(): EnvironmentProviders {
    return provideEnvironmentInitializer(() => {
      inject(NgxsActionCollector).start();
    });
  }

  private _destroyed$ = new ReplaySubject<void>(1);
  private _stopped$ = new Subject<void>();
  private _started = false;

  readonly dispatched: any[] = [];
  readonly completed: any[] = [];
  readonly successful: any[] = [];
  readonly errored: any[] = [];
  readonly cancelled: any[] = [];

  private _actions$ = inject(Actions);

  constructor() {
    inject(DestroyRef).onDestroy(() => this._destroyed$.next());
  }

  start() {
    if (this._started) {
      return;
    }
    this._started = true;
    this._actions$.pipe(takeUntil(this._destroyed$), takeUntil(this._stopped$)).subscribe({
      next: (ctx: ActionContext) => {
        switch (ctx?.status) {
          case ActionStatus.Dispatched:
            this.dispatched.push(ctx.action);
            break;
          case ActionStatus.Successful:
            this.successful.push(ctx.action);
            this.completed.push(ctx.action);
            break;
          case ActionStatus.Errored:
            this.errored.push(ctx.action);
            this.completed.push(ctx.action);
            break;
          case ActionStatus.Canceled:
            this.cancelled.push(ctx.action);
            this.completed.push(ctx.action);
            break;
          default:
            break;
        }
      },
      complete: () => {
        this._started = false;
      },
      error: () => {
        this._started = false;
      }
    });
  }

  reset() {
    function clearArray(array: any[]) {
      array.splice(0, array.length);
    }
    clearArray(this.dispatched);
    clearArray(this.completed);
    clearArray(this.successful);
    clearArray(this.errored);
    clearArray(this.cancelled);
  }

  stop() {
    this._stopped$.next();
  }
}
