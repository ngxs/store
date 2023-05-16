import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { StoreModule } from './store/store.module';

const routes: Routes = [{ path: '', component: AppComponent }];

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'hello-world-ng16' }),
    RouterModule.forRoot(routes),
    StoreModule
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
