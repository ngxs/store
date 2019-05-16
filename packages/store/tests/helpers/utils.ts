import { Injectable, ErrorHandler } from '@angular/core';

@Injectable()
export class NoopErrorHandler implements ErrorHandler {
  handleError(_: any) {
    /* noop*/
  }
}
