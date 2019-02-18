import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { AppComponent } from './app.component';
import { AppState } from './app.state';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxsModule.forRoot([AppState])],
  bootstrap: [AppComponent]
})
export class AppModule {}
