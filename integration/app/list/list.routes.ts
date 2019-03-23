import { Routes } from '@angular/router';
import { ListComponent } from '@integration/list/list.component';
import { ListResolver } from '@integration/list/list.resolver';

export const routes: Routes = [
  {
    path: '',
    component: ListComponent,
    resolve: {
      list: ListResolver
    }
  }
];
