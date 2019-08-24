import { getActionTypeFromInstance, Store } from '@ngxs/store';

import { formatTime } from './internals';
import { LogWriter } from './log-writer';

export class ActionLogger {
  private synchronousWorkEnded = false;
  private actionCompleted = false;
  private startedTime = new Date();

  constructor(private action: any, private store: Store, private logWriter: LogWriter) {}

  dispatched(state: any) {
    const message = this.getActionLogHeader();
    this.logWriter.startGroup(message);

    // print payload only if at least one property is supplied
    if (this._hasPayload(this.action)) {
      this.logWriter.logGrey('payload', { ...this.action });
    }

    this.logWriter.logGrey('prev state', state);
  }

  completed(nextState: any) {
    if (this.synchronousWorkEnded) {
      const message = `(async work completed) ${this.getActionLogHeader()}`;
      this.logWriter.startGroup(message);
    }
    this.logWriter.logGreen('next state', nextState);
    this.logWriter.endGroup();
    this.actionCompleted = true;
  }

  errored(error: any) {
    if (this.synchronousWorkEnded) {
      const message = `(async work error) ${this.getActionLogHeader()}`;
      this.logWriter.startGroup(message);
    }
    this.logWriter.logRedish('next state after error', this.store.snapshot());
    this.logWriter.logRedish('error', error);
    this.logWriter.endGroup();
    this.actionCompleted = true;
  }

  syncWorkComplete() {
    if (!this.actionCompleted) {
      this.logWriter.logGreen('next state (synchronous)', this.store.snapshot());
      this.logWriter.logGreen('( action doing async work... )', undefined);
      this.logWriter.endGroup();
    }
    this.synchronousWorkEnded = true;
  }

  private getActionLogHeader() {
    const actionName = getActionTypeFromInstance(this.action);
    const formattedTime = formatTime(this.startedTime);
    const message = `action ${actionName} (started @ ${formattedTime})`;
    return message;
  }

  private _hasPayload(event: any) {
    const nonEmptyProperties = this._getNonEmptyProperties(event);
    return nonEmptyProperties.length > 0;
  }

  private _getNonEmptyProperties(event: any) {
    const keys = Object.keys(event);
    const values = keys.map(key => event[key]);
    return values.filter(value => !!value);
  }
}
