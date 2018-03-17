# Error Handling
NGXS uses Angular's default `ErrorHandler` class so if actions error, it will participate
in the standard flow. You can easily override this flow by providing your own handler like so:

```javascript
import { NgModule, ErrorHandler } from '@angular/core';

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
