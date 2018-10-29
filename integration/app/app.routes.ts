import { Routes } from '@angular/router';
import { MenuComponent } from './menu.component';

export const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'list', loadChildren: './list/list.module#ListModule' },
  { path: 'detail', loadChildren: './detail/detail.module#DetailModule' }
];
