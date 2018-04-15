# Error Handling
NGXS uses Angular's default `ErrorHandler` class so if actions error, it will participate
in the standard flow. You can easily override this flow by providing your own handler like so:

```typescript
import { NgModule, ErrorHandler } from '@angular/core';

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  handleError(error: any) {
    console.log('ERRORR!, error);

    // Make sure to rethrow so Angular picks it up
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
