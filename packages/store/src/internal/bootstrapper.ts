import { Injectable } from '@angular/core';

import { Subject, Observable } from 'rxjs';

@Injectable()
export class Bootstrapper {
  private _bootstrap$ = new Subject<void>();

  get appBootstrapped$(): Observable<void> {
    return this._bootstrap$.asObservable();
  }

  bootstrap(): void {
    this._bootstrap$.next();
    this._bootstrap$.complete();
  }
}
