# @ngxs/logger


```TS
// app.module.ts

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot(),
    NgxsLoggerPluginModule.forRoot(),
  ]
})
export class AppModule { }
```
