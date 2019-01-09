import { Injectable } from '@angular/core';

import { Subject, Observable } from 'rxjs';

@Injectable()
export class Bootstrapper {
  private bootstrap$ = new Subject<void>();

  get appBootstrapped$(): Observable<void> {
    return this.bootstrap$.asObservable();
  }

  /**
   * This event will be emitted after attaching `ComponentRef` of the root component
   * to the tree of views, that's a signal that application has been fully rendered
   */
  bootstrap(): void {
    this.bootstrap$.next();
    this.bootstrap$.complete();
  }
}
