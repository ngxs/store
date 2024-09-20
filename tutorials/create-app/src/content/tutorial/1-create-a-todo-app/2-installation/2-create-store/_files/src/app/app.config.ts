import { TodoState } from './todo/store/todo.state';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ApplicationConfig } from '@angular/core';
import { provideStore } from '@ngxs/store';

export const config: ApplicationConfig = {
  providers: [provideAnimations(), provideHttpClient(), provideStore([])]
};
