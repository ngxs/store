import { Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

import { NgxsConfig } from '../symbols';
import { SelectorStrategy } from './symbols';

@Injectable()
export class SelectionGlobalStrategy implements SelectorStrategy {
  constructor(private _config: NgxsConfig) {}

  /**
   * The default strategy defines the standard behavior of the NGXS:
   * unsubscribe at the first error in the stream.
   * @param errors
   */
  public retryWhenHandler(errors: Observable<Error | any>): Observable<Error | any> {
    return errors.pipe(
      tap(error => {
        throw error;
      })
    );
  }

  /**
   * if error is TypeError we swallow it to prevent usual errors with property access
   * @param err
   */
  public catchErrorHandler(
    err: Error
  ): Observable<any> | Observable<never> | Observable<undefined> {
    const { suppressErrors } = this._config.selectorOptions;
    const suppressTypeError: boolean = !!(err instanceof TypeError && suppressErrors);
    return suppressTypeError ? of(undefined) : throwError(err);
  }
}
