import { Observable } from 'rxjs';

export interface SelectorStrategy {
  retryWhenHandler(errors: Observable<Error | any>): Observable<any>;
  catchErrorHandler(err: Error): Observable<any> | Observable<never> | Observable<undefined>;
}
