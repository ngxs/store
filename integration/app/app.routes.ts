import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/list' },
  { path: 'list', loadChildren: '@integration/lazy/list/list.module#ListModule' },
  { path: 'detail', loadChildren: '@integration/lazy/detail/detail.module#DetailModule' }
];
