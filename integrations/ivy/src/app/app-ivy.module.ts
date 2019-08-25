import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { StoreIvyModule } from './store-ivy.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    StoreIvyModule,
    RouterModule.forRoot([{ path: '', component: AppComponent }])
  ],
  bootstrap: [AppComponent]
})
export class AppIvyModule {}
