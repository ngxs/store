import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { StoreModule } from './store/store.module';

const routes: Routes = [{ path: '', component: AppComponent }];
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), StoreModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
