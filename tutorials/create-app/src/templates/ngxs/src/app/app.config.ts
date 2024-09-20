import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngxs/store';
import { TodoState } from './todo/store/todo.state';

export const config: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    // add the TodoState to the provideStore array
    provideStore([])
  ]
};
