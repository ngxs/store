import { Inject, Injectable, Injector, NgZone, OnDestroy, ɵglobal } from '@angular/core';
import { getActionTypeFromInstance, NgxsNextPluginFn, NgxsPlugin, Store } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';

import {
  NGXS_DEVTOOLS_OPTIONS,
  NgxsDevtoolsAction,
  NgxsDevtoolsExtension,
  NgxsDevtoolsOptions
} from './symbols';

const enum ReduxDevtoolsActionType {
  Dispatch = 'DISPATCH',
  Action = 'ACTION'
}

const enum ReduxDevtoolsPayloadType {
  JumpToAction = 'JUMP_TO_ACTION',
  JumpToState = 'JUMP_TO_STATE',
  ToggleAction = 'TOGGLE_ACTION',
  ImportState = 'IMPORT_STATE'
}

/**
 * Adds support for the Redux Devtools extension:
 * http://extension.remotedev.io/
 */
@Injectable()
export class NgxsReduxDevtoolsPlugin implements OnDestroy, NgxsPlugin {
  private devtoolsExtension: NgxsDevtoolsExtension | null = null;
  private readonly globalDevtools =
    ɵglobal['__REDUX_DEVTOOLS_EXTENSION__'] || ɵglobal['devToolsExtension'];

  private unsubscribe: VoidFunction | null = null;

  constructor(
    @Inject(NGXS_DEVTOOLS_OPTIONS) private _options: NgxsDevtoolsOptions,
    private _injector: Injector,
    private _ngZone: NgZone
  ) {
    this.connect();
  }

  ngOnDestroy(): void {
    if (this.unsubscribe !== null) {
      this.unsubscribe();
    }
    if (this.globalDevtools) {
      this.globalDevtools.disconnect();
    }
  }

  /**
   * Lazy get the store for circular dependency issues
   */
  private get store(): Store {
    return this._injector.get<Store>(Store);
  }

  /**
   * Middleware handle function
   */
  handle(state: any, action: any, next: NgxsNextPluginFn) {
    if (!this.devtoolsExtension || this._options.disabled) {
      return next(state, action);
    }

    return next(state, action).pipe(
      catchError(error => {
        const newState = this.store.snapshot();
        this.sendToDevTools(state, action, newState);
        throw error;
      }),
      tap(newState => {
        this.sendToDevTools(state, action, newState);
      })
    );
  }

  private sendToDevTools(state: any, action: any, newState: any) {
    const type = getActionTypeFromInstance(action);
    // if init action, send initial state to dev tools
    const isInitAction = type === '@@INIT';
    if (isInitAction) {
      this.devtoolsExtension!.init(state);
    } else {
      this.devtoolsExtension!.send({ ...action, action: null, type }, newState);
    }
  }

  /**
   * Handle the action from the dev tools subscription
   */
  dispatched(action: NgxsDevtoolsAction) {
    if (action.type === ReduxDevtoolsActionType.Dispatch) {
      if (
        action.payload.type === ReduxDevtoolsPayloadType.JumpToAction ||
        action.payload.type === ReduxDevtoolsPayloadType.JumpToState
      ) {
        const prevState = JSON.parse(action.state);
        this.store.reset(prevState);
      } else if (action.payload.type === ReduxDevtoolsPayloadType.ToggleAction) {
        console.warn('Skip is not supported at this time.');
      } else if (action.payload.type === ReduxDevtoolsPayloadType.ImportState) {
        const {
          actionsById,
          computedStates,
          currentStateIndex
        } = action.payload.nextLiftedState;
        this.devtoolsExtension!.init(computedStates[0].state);
        Object.keys(actionsById)
          .filter(actionId => actionId !== '0')
          .forEach(actionId =>
            this.devtoolsExtension!.send(actionsById[actionId], computedStates[actionId].state)
          );
        this.store.reset(computedStates[currentStateIndex].state);
      }
    } else if (action.type === ReduxDevtoolsActionType.Action) {
      const actionPayload = JSON.parse(action.payload);
      this.store.dispatch(actionPayload);
    }
  }

  private connect(): void {
    if (!this.globalDevtools || this._options.disabled) {
      return;
    }

    // The `connect` method adds `message` event listener since it communicates
    // with an extension through `window.postMessage` and message events.
    // We handle only 2 events; thus, we don't want to run many change detections
    // because the extension sends events that we don't have to handle.
    this.devtoolsExtension = this._ngZone.runOutsideAngular(
      () => <NgxsDevtoolsExtension>this.globalDevtools.connect(this._options)
    );

    this.unsubscribe = this.devtoolsExtension.subscribe(action => {
      if (
        action.type === ReduxDevtoolsActionType.Dispatch ||
        action.type === ReduxDevtoolsActionType.Action
      ) {
        this._ngZone.run(() => {
          this.dispatched(action);
        });
      }
    });
  }
}
