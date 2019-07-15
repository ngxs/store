import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', redirectTo: '/list' },
      {
        path: 'list',
        loadChildren: () => import('@integration/list/list.module').then(m => m.ListModule)
      },
      {
        path: 'detail',
        loadChildren: () =>
          import('@integration/detail/detail.module').then(m => m.DetailModule)
      },
      {
        path: 'counter',
        loadChildren: () =>
          import('@integration/counter/counter.module').then(m => m.CounterModule)
      }
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
