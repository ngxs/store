import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StoreModule } from './store.module';
import { AppComponent } from './app.component';

const routes: Routes = [{ path: '', component: AppComponent }];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), StoreModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
