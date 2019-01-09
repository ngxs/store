import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class Bootstrapper {
  private bootstrap$ = new BehaviorSubject(false);

  get appBootstrapped$(): Observable<boolean> {
    return this.bootstrap$.asObservable();
  }

  /**
   * This event will be emitted after attaching `ComponentRef` of the root component
   * to the tree of views, that's a signal that application has been fully rendered
   */
  bootstrap(): void {
    this.bootstrap$.next(true);
    this.bootstrap$.complete();
  }
}
