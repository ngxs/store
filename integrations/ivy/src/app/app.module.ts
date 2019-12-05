import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { StoreModule } from './store/store.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([{ path: '', component: AppComponent }]),
    StoreModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
