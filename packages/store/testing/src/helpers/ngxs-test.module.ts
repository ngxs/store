import { ApplicationRef, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgxsTestComponent } from './ngxs-test.component';

@NgModule({
  imports: [BrowserModule],
  declarations: [NgxsTestComponent],
  entryComponents: [NgxsTestComponent]
})
export class NgxsTestModule {
  public static ngDoBootstrap(app: ApplicationRef): void {
    app.bootstrap(NgxsTestComponent);
  }
}
