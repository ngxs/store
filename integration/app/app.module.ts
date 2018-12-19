import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from '@integration/app.component';
import { routes } from '@integration/app.routes';
import { NgxsStoreModule } from '@integration/store/store.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    FormsModule,
    NgxsStoreModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    BrowserModule.withServerTransition({ appId: 'my-app' })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
