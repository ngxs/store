import { DestroyRef, inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ɵNgxsAppBootstrappedState extends BehaviorSubject<boolean> {
  constructor() {
    super(false);

    const destroyRef = inject(DestroyRef);
    // Complete the subject once the root injector is destroyed to ensure
    // there are no active subscribers that would receive events or perform
    // any actions after the application is destroyed.
    destroyRef.onDestroy(() => this.complete());
  }

  bootstrap(): void {
    this.next(true);
  }
}
