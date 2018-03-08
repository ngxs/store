import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/list' },
  { path: 'list', loadChildren: './list/list.module#ListModule' },
  { path: 'detail', loadChildren: './detail/detail.module#DetailModule' }
];
