import { ObjectUtils } from '../../object-utils';
import { HmrSnapshot } from './symbol';

/**
 * Only use for NGXS HMR and StateFactory
 */
export class NgxsHmrRuntime {
  private static _snapshot: HmrSnapshot = {};

  public static get snapshot(): HmrSnapshot {
    return NgxsHmrRuntime.sizeSnapshot > 0 ? NgxsHmrRuntime.clone() : {};
  }

  public static set snapshot(value: HmrSnapshot) {
    this._snapshot = value || {};
  }

  public static get sizeSnapshot(): number {
    return Object.keys(this._snapshot).length;
  }

  public static clear(): void {
    NgxsHmrRuntime._snapshot = {};
  }

  private static clone(): HmrSnapshot {
    return ObjectUtils.clone(this._snapshot);
  }
}
