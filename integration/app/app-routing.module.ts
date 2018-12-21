import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', redirectTo: '/list' },
      { path: 'list', loadChildren: '@integration/list/list.module#ListModule' },
      { path: 'detail', loadChildren: '@integration/detail/detail.module#DetailModule' }
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
