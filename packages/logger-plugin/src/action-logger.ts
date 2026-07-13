import { Store } from '@ngxs/store';
import { getActionTypeFromInstance } from '@ngxs/store/plugins';

import { formatTime } from './internals';
import { LogWriter } from './log-writer';

export class ActionLogger {
  private _synchronousWorkEnded = false;
  private _actionCompleted = false;
  private _startedTime = new Date();

  constructor(
    private action: any,
    private store: Store,
    private logWriter: LogWriter
  ) {}

  dispatched(state: any) {
    const message = this._getActionLogHeader();
    this.logWriter.startGroup(message);

    // print payload only if at least one property is supplied
    if (this._hasPayload(this.action)) {
      this.logWriter.logGrey('payload', { ...this.action });
    }

    this.logWriter.logGrey('prev state', state);
  }

  completed(nextState: any) {
    if (this._synchronousWorkEnded) {
      this.logWriter.startGroup(`(async work completed) ${this._getActionLogHeader()}`);
    }
    this.logWriter.logGreen('next state', nextState);
    this.logWriter.endGroup();
    this._actionCompleted = true;
  }

  errored(error: any) {
    if (this._synchronousWorkEnded) {
      this.logWriter.startGroup(`(async work error) ${this._getActionLogHeader()}`);
    }
    this.logWriter.logRedish('next state after error', this.store.snapshot());
    this.logWriter.logRedish('error', error);
    this.logWriter.endGroup();
    this._actionCompleted = true;
  }

  syncWorkComplete() {
    if (!this._actionCompleted) {
      this.logWriter.logGreen('next state (synchronous)', this.store.snapshot());
      this.logWriter.logGreen('( action doing async work... )', undefined);
      this.logWriter.endGroup();
    }
    this._synchronousWorkEnded = true;
  }

  private _getActionLogHeader() {
    const actionName = getActionTypeFromInstance(this.action);
    const formattedTime = formatTime(this._startedTime);
    return `action ${actionName} (started @ ${formattedTime})`;
  }

  private _hasPayload(event: any) {
    return this._getNonEmptyProperties(event).length > 0;
  }

  private _getNonEmptyProperties(event: any) {
    const keys = Object.keys(event);
    const values = keys.map(key => event[key]);
    return values.filter(value => value !== undefined);
  }
}
