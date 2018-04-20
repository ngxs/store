# Error Handling
NGXS uses Angulars default `ErrorHandler` class so if actions error, it will participate
in the standard flow. You can easily override this flow by providing your own handler like so:

```TS
import { NgModule, ErrorHandler } from '@angular/core';

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  handleError(error: any) {
    console.log('ERROR! ', error);

    // Make sure to rethrow the error so Angular can pick it up
    throw error;
  }
}


@NgModule({
  imports: [AppComponent],
  providers: [
    {
      provide: ErrorHandler, 
      useClass: MyErrorHandler
    }
  ]
})
export class AppModule { }
```
