import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ɵNgxsAppBootstrappedState extends ReplaySubject<boolean> {
  constructor() {
    super(1);
  }

  bootstrap(): void {
    this.next(true);
    this.complete();
  }
}
