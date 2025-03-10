import { Observable } from 'rxjs';

export function ɵof<T>(value: T) {
  // Manually creating the observable pulls less symbols from RxJS than `of(value)`.
  return new Observable<T>(subscriber => {
    subscriber.next(value);
    subscriber.complete();
  });
}
