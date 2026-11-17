import { Store } from '@ngxs/store';
import { getActionTypeFromInstance } from '@ngxs/store/plugins';

import { formatTime } from './internals';
import { LogWriter } from './log-writer';

export class ActionLogger {
  private _closed = false;

  constructor(
    private action: any,
    private store: Store,
    private logWriter: LogWriter
  ) {}

  dispatched(state: any) {
    this._closed = false;
    const actionName = getActionTypeFromInstance(this.action);
    const formattedTime = formatTime(new Date());

    const message = `action ${actionName} @ ${formattedTime}`;
    this.logWriter.startGroup(message);

    // print payload only if at least one property is supplied
    if (this._hasPayload(this.action)) {
      this.logWriter.logGrey('payload', { ...this.action });
    }

    this.logWriter.logGrey('prev state', state);
  }

  completed(nextState: any) {
    this.logWriter.logGreen('next state', nextState);
    this.logWriter.endGroup();
    this._closed = true;
  }

  errored(error: any) {
    this.logWriter.logRedish('next state after error', this.store.snapshot());
    this.logWriter.logRedish('error', error);
    this.logWriter.endGroup();
    this._closed = true;
  }

  cancelled() {
    // The action stream was cut off before it completed or errored, e.g.
    // by `@Action({ cancelUncompleted: true })` dispatching the same action
    // again. The console group opened in `dispatched()` would otherwise
    // stay open forever, leaving all subsequent logs indented.
    // See https://github.com/ngxs/store/issues/1657
    if (this._closed) {
      return;
    }
    this._closed = true;
    this.logWriter.endGroup();
  }

  private _hasPayload(event: any) {
    const nonEmptyProperties = this._getNonEmptyProperties(event);
    return nonEmptyProperties.length > 0;
  }

  private _getNonEmptyProperties(event: any) {
    const keys = Object.keys(event);
    const values = keys.map(key => event[key]);
    return values.filter(value => value !== undefined);
  }
}
