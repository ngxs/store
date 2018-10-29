import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  template: `
    <p class="menu">
      <b>Menu</b>:
      <a [routerLink]="['/list']">List</a>
      <a [routerLink]="['/detail']">Detail</a>
    </p>
  `
})
export class MenuComponent {}
