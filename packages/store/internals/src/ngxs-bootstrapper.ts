import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class NgxsBootstrapper {
  /**
   * Use `ReplaySubject`, thus we can get cached value even if the stream is completed
   */
  private bootstrap$ = new ReplaySubject<boolean>(1);

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
