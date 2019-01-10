import { NgZone } from '@angular/core';

import { MonoTypeOperatorFunction } from 'rxjs';

import { leaveZone } from './leave-zone';
import { enterZone } from './enter-zone';

/**
 * Returns operator based on the provided condition `outsideZone`, that will run
 * `subscribe` inside or outside Angular's zone
 */
export function wrap<T>(outsideZone: boolean, zone: NgZone): MonoTypeOperatorFunction<T> {
  if (outsideZone) {
    return leaveZone<T>(zone);
  }

  return enterZone<T>(zone);
}
