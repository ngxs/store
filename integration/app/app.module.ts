import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxsModule, LocalStoragePlugin } from 'ngxs';

import { TodoStore } from './todo.store';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxsModule.forRoot([TodoStore])],
  bootstrap: [AppComponent]
})
export class AppModule {}
