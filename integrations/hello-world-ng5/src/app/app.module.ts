import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
// import { NgxsModule } from '@ngxs/store';

@NgModule({
  declarations: [AppComponent],
  // fix me after they add support
  // imports: [BrowserModule, NgxsModule.forRoot([])],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
