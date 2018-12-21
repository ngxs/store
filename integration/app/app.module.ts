import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from '@integration/app-routing.module';
import { AppComponent } from '@integration/app.component';
import { NgxsStoreModule } from '@integration/store/store.module';

@NgModule({
  imports: [
    FormsModule,
    NgxsStoreModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserModule.withServerTransition({ appId: 'my-app' })
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
